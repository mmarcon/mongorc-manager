const os = require('os');
const path = require('path');
const debug = require('debug')('mongorc-manager');
const package = require('./package.json');

const mongorcPath = path.join(os.homedir(), '.mongorc.js');
const mongorcBackupPath = path.join(os.homedir(), '.mongorc.original.js');
const WATERMARK = `managed by ${package.name}`;

function _checkMongorc(fileManager) {
    debug(mongorcPath);
    if(!fileManager.fileExistsRW(mongorcPath)) {
        debug(`${mongorcPath} not found. Will create one.`);
        return _createMongorc(fileManager);
    }
    let lines = fileManager.readAsArray(mongorcPath);
    if (lines[0].includes(WATERMARK)) {
        debug(`${mongorcPath} found and already managed`);
        return lines;
    }
    debug(`${mongorcPath} found but not managed`);
    _backupExistingFile(fileManager);
    lines = _createMongorc(fileManager);
    //Refer back to the old .mongorc.js so no previous
    //configuration gets lost.
    lines = _linkLibrary(mongorcBackupPath, fileManager, lines);
    return lines;
}

function _backupExistingFile(fileManager) {
    debug(`Backing up ${mongorcPath} to ${mongorcBackupPath}`);
    return fileManager.rename(mongorcPath, mongorcBackupPath);
}

function _createMongorc(fileManager) {
    debug(`Creating ${mongorcPath}`);
    const lines = [`//${WATERMARK}//`];
    fileManager.writeFromArray(mongorcPath, lines);
    return lines;
}

function _linkLibrary(path, fileManager, lines) {
    debug(`Linking ${path} to ${mongorcPath}`);
    const alreadyLinkedPath = lines.find(l => l.includes(path));
    if(alreadyLinkedPath) {
        return console.warn('Skipping: library already linked.');
    }
    lines.push(`load('${path}');`);
    fileManager.writeFromArray(mongorcPath, lines);
    return lines;
}

function linkLibrary(path, fileManager) {
    const lines = _checkMongorc(fileManager);
    return _linkLibrary(path, fileManager, lines);
}

function unlinkLibrary(path, fileManager) {
    const lines = _checkMongorc(fileManager);
    debug(`Unlinking ${path} from ${mongorcPath}`);
    const linesWithoutUnlinked = lines.filter(l => !l.includes(path));
    fileManager.writeFromArray(mongorcPath, linesWithoutUnlinked);
    return linesWithoutUnlinked;
}

function listLinkedLibraries(fileManager, c=console) {
    const lines = _checkMongorc(fileManager);
    c.log('Libraries linked to your .mongorc.js');
    lines.forEach(l => {
        const matcher = l.match(/load\('(.*)'\);/i);
        if (matcher) {
            c.log(` ${matcher[1]}`);
        }
    });
}

 module.exports = {
     linkLibrary,
     unlinkLibrary,
     listLinkedLibraries,
     _checkMongorc,
     _backupExistingFile,
     _createMongorc,
     _linkLibrary,
     mongorcPath,
     mongorcBackupPath,
     WATERMARK
 };