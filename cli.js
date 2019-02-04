#!/usr/bin/env node
const yargs = require('yargs');
const debug = require('debug')('mongorc-manager-cli');
const path = require('path');
const mongorcmgr = require('./mongorc-manager');
const fileManager = require('./lib/file-manager');
const package = require('./package.json');

debug(`Node ${process.version}`);
debug(`${package.name} v${package.version}`);

const args = cmdline();

//Read command-line
function cmdline() {
    return yargs
        .option('link', {
            alias: 'l',
            describe: 'link a JS file to your .mongorc.js'
        })
        .option('unlink', {
            alias: 'u',
            describe: 'unlink a JS file from your .mongorc.js'
        })
        .option('list', {
            describe: 'list the JS files linked to your .mongorc.js'
        })
        .argv;
}

if (args.list) {
    debug('command::list');
    return mongorcmgr.listLinkedLibraries(fileManager);
}
if (args.link) {
    debug('command::link');
    return mongorcmgr.linkLibrary(path.resolve(process.cwd(), args.link), fileManager);
}
if (args.unlink) {
    debug('command::unlink');
    return mongorcmgr.unlinkLibrary(args.unlink, fileManager);
}