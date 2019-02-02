#!/usr/bin/env node
const yargs = require('yargs');
const debug = require('debug')('mongorc-manager-cli');
const mongorcmgr = require('.');
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
    return mongorcmgr.listLinkedLibraries();
}
if (args.link) {
    debug('command::link');
    return mongorcmgr.linkLibrary(args.link);
}
if (args.unlink) {
    debug('command::unlink');
    return mongorcmgr.unlinkLibrary(args.unlink);
}