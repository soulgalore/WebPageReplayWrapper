#!/usr/bin/env node

'use strict';

const minimist = require('minimist');
const WebPageReplay = require('../lib/');

const defaultHTTPPort = 8080;
const defaultHTTPSPort = 8081;
const defaultTmpFile = '';

const argv = minimist(process.argv.slice(2), {
  boolean: ['start', 'stop']
});

function startStop(wpt, argv) {
  const recordOrReplay = argv._[0];
  if (recordOrReplay === 'record' && argv.stop) {
    wpt.stopRecord();
  } else if (recordOrReplay === 'record') {
    wpt.startRecord();
  } else if (argv.stop) {
    wpt.stopReplay();
  } else {
    wpt.startReplay();
  }
}

if (argv.help) {
  console.log('   Start/stop WebPageReplay record and replay');
  console.log('   Usage: webpagereplaywrapper replay/record [options]');
  console.log('   Options:');
  console.log('   --start           Start the server');
  console.log('   --stop            Stop the server');
  console.log('   --http            HTTP port [' + defaultHTTPPort + ']');
  console.log('   --https           HTTPS port [' + defaultHTTPSPort + ']');
  console.log(
    '   --tmp             Path and filename to the file where you store the WPR data'
  );
  console.log('   --path            The full path to WebPageReplay directory');
} else {
  if (!argv.path) {
    throw Error('Missing the full path to WebPageReplay dir');
  } else {
    const options = {
      httpPort: argv.http || defaultHTTPPort,
      httpsPort: argv.https || defaultHTTPSPort,
      pathToArchiveFile: argv.tmp || defaultTmpFile,
      webPageReplayPath: argv.path
    };
    const wpt = new WebPageReplay(options);

    startStop(wpt, argv);
    process.exit();

  }
}
