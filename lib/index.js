'use strict';

const { spawn, spawnSync } = require('child_process');
const fs = require('fs');
const timeout = 60000;
const replayOut = '/tmp/wpr-replay-out.log';
const replayErr = '/tmp/wpr-replay-err.log';
const recordOut = '/tmp/wpr-record-out.log';
const recordErr = '/tmp/wpr-record-err.log';

function waitForStart(file) {
  let timer;

  function check(fulfill, reject) {
    const value = fs.readFileSync(file, {
      encoding: 'utf-8'
    });
    if (value.indexOf('Failed to start server on') > -1) {
      console.log('Failed starting server:' + value);
      clearInterval(timer);
      reject(value);
    } else if (value.indexOf('Starting server on') > -1) {
      console.log('Server started ...');
      clearInterval(timer);
      fulfill();
    }
  }

  return new Promise(function(fulfill, reject) {
    timer = setInterval(check, 500, fulfill, reject);
  });
}

class WebPageReplay {
  constructor(config) {
    this.httpPort = config.httpPort || 8080;
    this.httpsPort = config.httpsPort || 8081;
    this.https_cert_file = config.certFile;
    this.https_key_file = config.keyFile;
    this.inject_scripts = config.injectScripts;
    this.pathToArchiveFile = config.pathToArchiveFile || '/tmp/archive.wprgo';
  }

  startRecord() {
    // The current version of WebPageReplay doesn't give any error
    // if the port is already busy just so we know
    const out = fs.openSync(recordOut, 'w'),
      err = fs.openSync(recordErr, 'w');

    const webPageRecord = spawn(
      'wpr',
      [
        'record',
        '--http_port',
        this.httpPort,
        '--https_port',
        this.httpsPort,
        '--https_cert_file',
        this.https_cert_file,
        '--https_key_file',
        this.https_key_file,
        '--inject_scripts',
        this.inject_scripts,
        this.pathToArchiveFile
      ],
      {
        detached: true,
        stdio: ['ignore', out, err]
      }
    );
    webPageRecord.unref();
    return waitForStart(recordErr);
  }

  stopRecord() {
    // Super simple kill at the moment,
    // we can make this better in the future
    const port = this.httpsPort;
    let webPageRecord = spawnSync('pkill', ['-2', '-f', 'https_port ' + port], {
      timeout
    });

    return new Promise(function(fulfill, reject) {
      if (webPageRecord.error) {
        console.error(
          webPageRecord.error +
            ' ' +
            webPageRecord.stdout +
            ' ' +
            webPageRecord.stderr
        );
        console.log(
          'Could not stop the WebPagRecord process: + ' + webPageRecord.error
        );

        console.log('Will kill the WebPageRecord process hard');

        // Then try to kill it hard
        webPageRecord = spawnSync('pkill', ['-9', '-f', 'https_port ' + port], {
          timeout
        });
        reject('Could not exit the WebPageRecord process');
      } else {
        console.log('Stopped WebPageReplay record server');
        fulfill();
      }
    });
  }

  startReplay() {
    const out = fs.openSync(replayOut, 'w'),
      err = fs.openSync(replayErr, 'w');
    const webPageReplay = spawn(
      'wpr',
      [
        'replay',
        '--http_port',
        this.httpPort,
        '--https_port',
        this.httpsPort,
        '--https_cert_file',
        this.https_cert_file,
        '--https_key_file',
        this.https_key_file,
        '--inject_scripts',
        this.inject_scripts,
        this.pathToArchiveFile
      ],
      {
        detached: true,
        stdio: ['ignore', out, err]
      }
    );
    webPageReplay.unref();
    return waitForStart(replayErr);
  }

  stopReplay() {
    // Super simple kill at the moment,
    // we can make this better in the future
    const port = this.httpsPort;
    let webPageReplay = spawnSync('pkill', ['-2', '-f', 'https_port ' + port], {
      timeout
    });

    return new Promise(function(fulfill, reject) {
      if (webPageReplay.error) {
        console.error(
          webPageReplay.error +
            ' ' +
            webPageReplay.stdout +
            ' ' +
            webPageReplay.stderr
        );
        console.log(
          'Could not stop the WebPageReplay replay process: + ' +
            this.webPageReplay.error
        );

        // Then try to kill it hard
        webPageReplay = spawnSync('pkill', ['-9', '-f', 'https_port ' + port], {
          timeout
        });

        reject('Could not exit the WebPageReplay process');
      } else {
        console.log('Stopped WebPageReplay replay server');
        fulfill();
      }
    });
  }
}

module.exports = WebPageReplay;
