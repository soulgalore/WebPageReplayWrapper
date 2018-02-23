'use strict';

const { spawn, spawnSync } = require('child_process');

const timeout = 60000;

class WebPageReplay {
  constructor(config) {
    this.httpPort = config.httpPort || 8080;
    this.httpsPort = config.httpsPort || 8081;
    this.https_cert_file = config.certFile;
    this.https_key_file = config.keyFile;
    this.inject_scripts = config.injectScripts;
    this.pathToArchiveFile = config.pathToArchiveFile || '/tmp/archive.wprgo';
    this.webPageRecord, this.webPageReplay;
  }

  startRecord() {
    // The current version of WebPageReplay doesn't give any error
    // if the port is already busy just so we know

    this.webPageRecord = spawn(
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
        stdio: 'ignore'
      }
    );

    this.webPageRecord.unref();
    console.log('Started WebPageReplay record server');
  }

  stopRecord() {
    // Super simple kill at the moment,
    // we can make this better in the future
    this.webPageRecord = spawnSync('pkill', [
      '-2',
      '-f',
      'https_port ' + this.httpsPort
    ], {timeout});
    
    if (this.webPageRecord.error) {
      console.error(this.webPageRecord.error + ' ' + this.webPageRecord.stdout + ' ' + this.webPageRecord.stderr);
      console.log('Could not stop the WebPagRecord process: + ' + this.webPageRecord.error);
    } else {
      console.log('Stopped WebPageReplay record server');
    }
  }

  startReplay() {

    this.webPageReplay = spawn(
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
        stdio: 'ignore'
      }
    );
    this.webPageReplay.unref();
    console.log('Started WebPageReplay replay server');

  }

  stopReplay() {
    // Super simple kill at the moment,
    // we can make this better in the future
    this.webPageReplay = spawnSync('pkill', [
      '-2',
      '-f',
      'https_port ' + this.httpsPort
    ],{timeout});

    if (this.webPageReplay.error) {
      console.error(this.webPageReplay.error + ' ' + this.webPageReplay.stdout + ' ' + this.webPageReplay.stderr);
      console.log('Could not stop the WebPageReplay replay process: + ' + this.webPageReplay.error);
    } else {
      console.log('Stopped WebPageReplay replay server');
    }

  }
}

module.exports = WebPageReplay;
