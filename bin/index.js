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
    return wpt.stopRecord();
  } else if (recordOrReplay === 'record') {
    return wpt.startRecord();
  } else if (argv.stop) {
    return wpt.stopReplay();
  } else {
    return wpt.startReplay();
  }
}

if (argv.help) {
  console.log('   Start/stop WebPageReplay record and replay. You need to have the WebPageReplay binary installed.');
  console.log('   Usage: webpagereplaywrapper replay/record [options]');
  console.log('   Options:');
  console.log('   --start           Start the server');
  console.log('   --stop            Stop the server');
  console.log('   --http            HTTP port [' + defaultHTTPPort + ']');
  console.log('   --https           HTTPS port [' + defaultHTTPSPort + ']');
  console.log('   --certFile        Full path to the certificate file');
  console.log('   --keyFile         Full path to the key file');
  console.log('   --injectScripts   A comma separated list of JavaScripts to be injected');
  console.log(
    '   --tmp             Path and filename to the file where you store the WPR data'
  );
} else if (!argv.certFile || !argv.keyFile || !argv.injectScripts) {
  throw Error('Missing certFile | keyfile | injectScripts');
} else {
    const options = {
      httpPort: argv.http || defaultHTTPPort,
      httpsPort: argv.https || defaultHTTPSPort,
      pathToArchiveFile: argv.tmp || defaultTmpFile,
      certFile: argv.certFile,
      keyFile: argv.keyFile,
      injectScripts: argv.injectScripts
    };
    const wpt = new WebPageReplay(options);

    startStop(wpt, argv);
}
