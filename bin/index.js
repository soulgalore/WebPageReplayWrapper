#!/usr/bin/env node

'use strict';

const minimist = require('minimist');
const WebPageReplay = require('../lib/');

const defaultHTTPPort = 8080;
const defaultHTTPSPort = 8081;
const defaultTmpFile = '';

const argv = minimist(process.argv.slice(2), {
  boolean: ['start', 'stop', 'record']
});

function startStop(wpt, argv) {
  if (argv.record && argv.stop) {
    return wpt.stopRecord();
  } else if (argv.record && argv.start) {
    return wpt.startRecord();
  } else if (argv.stop) {
    return wpt.stopReplay();
  } else {
    return wpt.startReplay();
  }
}

if (argv.help) {
  // Add some help here in the future
} else {
  if (!argv.path) {
    throw Error('Missing path to WebPageReplay');
  } else {
    const options = {
      httpPort: argv.http || defaultHTTPPort,
      httpsPort: argv.https || defaultHTTPSPort,
      pathToArchiveFile: argv.tmp || defaultTmpFile,
      webPageReplayPath: argv.path
    };
    const wpt = new WebPageReplay(options);

    startStop(wpt, argv);
  }
}
