const fs = require('fs');
const os = require('os');
const path = require('path');
const debug = require('debug')('mongorc-manager');
const package = require('./package.json');

const mongorcPath = path.join(os.homedir(), '.mongorc.js');
const mongorcBackupPath = path.join(os.homedir(), '.mongorc.original.js');
const WATERMARK = `managed by ${package.name}`;

function checkMongorc() {
    debug(mongorcPath);
    try {
        fs.accessSync(mongorcPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (e) {
        debug(`${mongorcPath} not found. Will create one.`);
        _createMongorc();
    }
    const fileContent = fs.readFileSync(mongorcPath, {
        encoding: 'utf8'
    });
    const lines = fileContent.split('\n');
    if (lines[0].includes(WATERMARK)) {
        debug(`${mongorcPath} found and already managed`);
        return true;
    }
    debug(`${mongorcPath} found but not managed`);
    _backupExistingFile();
    _createMongorc();
    //Refer back to the old .mongorc.js so no previous
    //configuration gets lost.
    _linkLibrary(mongorcBackupPath);
    return true;
}

function _backupExistingFile() {
    debug(`Backing up ${mongorcPath} to ${mongorcBackupPath}`);
    return fs.renameSync(mongorcPath, mongorcBackupPath);
}

function _createMongorc() {
    debug(`Creating ${mongorcPath}`);
    fs.writeFileSync(mongorcPath, `//${WATERMARK}//\n`, {
        encoding: 'utf8'
    });
}

function _linkLibrary(path) {
    debug(`Linking ${path} to ${mongorcPath}`);
    const fileContent = fs.readFileSync(mongorcPath, {
        encoding: 'utf8'
    });
    const lines = fileContent.split('\n');
    const alreadyLinkedPath = lines.find(l => l.includes(path));
    if(alreadyLinkedPath) {
        return console.warn('Skipping: library already linked.');
    }
    fs.appendFileSync(mongorcPath, `load('${path}');\n`);
}

function linkLibrary(path) {
    checkMongorc();
    _linkLibrary(path);
}

function unlinkLibrary(path) {
    checkMongorc();
    debug(`Unlinking ${path} from ${mongorcPath}`);
    const fileContent = fs.readFileSync(mongorcPath, {
        encoding: 'utf8'
    });
    const lines = fileContent.split('\n');
    const linesWithoutUnlinked = lines.filter(l => !l.includes(path));
    const destinationFileContent = linesWithoutUnlinked.join('\n');
    fs.writeFileSync(mongorcPath, destinationFileContent, {encoding: 'utf8'});
}

function listLinkedLibraries() {
    checkMongorc();
    const fileContent = fs.readFileSync(mongorcPath, {
        encoding: 'utf8'
    });
    const lines = fileContent.split('\n');
    console.log('Libraries linked to your .mongorc.js');
    lines.forEach(l => {
        const matcher = l.match(/load\('(.*)'\);/i);
        if (matcher) {
            console.log(` ${matcher[1]}`);
        }
    });
}

 module.exports = {
     linkLibrary,
     unlinkLibrary,
     listLinkedLibraries
 };