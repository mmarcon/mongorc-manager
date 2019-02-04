const test = require('tape');
const mongorcmgr = require('./mongorc-manager');

function runCountHelper(fn) {
    let runCount = 0;
    return function () {
        runCount++;
        fn.apply(fn, [...arguments, runCount]);
    }
}

test('file is created when not existing', t => {
    t.plan(3);
    const fileManager = {
        writeFromArray: (file, array) => {
            t.equal(file, mongorcmgr.mongorcPath, 'writes the right file');
            t.equal(array[0], `//${mongorcmgr.WATERMARK}//`, 'writes the right content');
        },
        fileExistsRW: file => {
            t.equal(file, mongorcmgr.mongorcPath, 'checks the right file');
            return false;
        }
    };
    mongorcmgr._checkMongorc(fileManager);
});

test('file is backed up when already existing and not managed', t => {
    t.plan(11);
    const fileManager = {
        fileExistsRW: file => {
            t.equal(file, mongorcmgr.mongorcPath, 'checks the right file');
            return true;
        },
        rename: (origin, dest) => {
            t.equal(origin, mongorcmgr.mongorcPath, 'renames the right file');
            t.equal(dest, mongorcmgr.mongorcBackupPath, 'backs up to the right file');
        },
        writeFromArray: runCountHelper((file, array, runCount) => {
            t.equal(file, mongorcmgr.mongorcPath, 'writes the right file');
            if (runCount === 1) {
                t.equal(array[0], `//${mongorcmgr.WATERMARK}//`, 'writes the right content the .mongorc.js is initialized');
                return;
            }
            if (runCount === 2) {
                t.equal(array[0], `//${mongorcmgr.WATERMARK}//`, 'writes the right watermark header');
                t.equal(array[1], `load('${mongorcmgr.mongorcBackupPath}');`, 'writes the right linked script');
                return;
            }
        }),
        readAsArray: file => {
            t.equal(file, mongorcmgr.mongorcPath, 'reads the right file');
            return ['function foo() {'];
        }
    };
    const lines = mongorcmgr._checkMongorc(fileManager);
    t.equal(lines[0], `//${mongorcmgr.WATERMARK}//`, 'lines contains the right watermark header');
    t.equal(lines[1], `load('${mongorcmgr.mongorcBackupPath}');`, 'lines contains the right linked script');
});

test('list linked libraries', t => {
    t.plan(4);
    const fileManager = {
        fileExistsRW: file => {
            return true;
        },
        readAsArray: file => {
            t.equal(file, mongorcmgr.mongorcPath, 'reads the right file');
            return [`//${mongorcmgr.WATERMARK}//`, `load('/foo/bar/monkey.js');`, `load('/foo/bar/dave.js');`];
        }
    };
    mongorcmgr.listLinkedLibraries(fileManager, {
        log: runCountHelper((m, runCount) => {
            if (runCount === 1) {
                t.pass('header gets printed out');
            }
            if (runCount === 2) {
                t.ok(m.includes('/foo/bar/monkey.js'), 'the first linked library gets printed out');
            }
            if (runCount === 3) {
                t.ok(m.includes('/foo/bar/dave.js'), 'the second linked library gets printed out');
            }
        })
    });
});

test('links library', t => {
    t.plan(5);
    const fileManager = {
        fileExistsRW: file => {
            return true;
        },
        readAsArray: file => {
            t.equal(file, mongorcmgr.mongorcPath, 'reads the right file');
            return [`//${mongorcmgr.WATERMARK}//`, `load('/foo/bar/monkey.js');`];
        },
        writeFromArray: (file, array) => {
            t.equal(file, mongorcmgr.mongorcPath, 'writes the right file');
            t.equal(array[0], `//${mongorcmgr.WATERMARK}//`, 'writes the right watermark header');
            t.equal(array[1], `load('/foo/bar/monkey.js');`, 'writes back the library that was already linked');
            t.equal(array[2], `load('/foo/bar/dave.js');`, 'writes the new library that was just linked');
        }
    };
    mongorcmgr.linkLibrary('/foo/bar/dave.js', fileManager);
});

test('unlinks library', t => {
    t.plan(4);
    const fileManager = {
        fileExistsRW: file => {
            return true;
        },
        readAsArray: file => {
            t.equal(file, mongorcmgr.mongorcPath, 'reads the right file');
            return [`//${mongorcmgr.WATERMARK}//`, `load('/foo/bar/monkey.js');`, `load('/foo/bar/dave.js');`];
        },
        writeFromArray: (file, array) => {
            t.equal(file, mongorcmgr.mongorcPath, 'writes the right file');
            t.equal(array[0], `//${mongorcmgr.WATERMARK}//`, 'writes the right watermark header');
            t.equal(array[1], `load('/foo/bar/dave.js');`, 'writes the new library that was just linked');
        }
    };
    mongorcmgr.unlinkLibrary('/foo/bar/monkey.js', fileManager);
});