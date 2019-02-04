const fs = require('fs');

function readAsArray(file) {
    const fileContent = fs.readFileSync(file, {
        encoding: 'utf8'
    });
    return fileContent.split('\n');
}

function writeFromArray(file, array) {
    const destinationFileContent = array.join('\n');
    return fs.writeFileSync(file, destinationFileContent, {
        encoding: 'utf8'
    });
}

function rename(origin, dest) {
    return fs.renameSync(origin, dest);
}

function fileExistsRW(file) {
    try {
        fs.accessSync(file, fs.constants.R_OK | fs.constants.W_OK);
        return true;
    } catch(_) {
        return false;
    }
}

module.exports = {
    readAsArray,
    writeFromArray,
    rename,
    fileExistsRW
};