'use strict';

const { spawn, spawnSync } = require('child_process');

class WebPageReplay {
  constructor(config) {
    this.httpPort = config.httpPort || 8080;
    this.httpsPort = config.httpsPort || 8081;
    this.https_cert_file = config.certFile;
    this.https_key_file = config.keyFile;
    this.pathToArchiveFile = config.pathToArchiveFile || '/tmp/archive.wprgo';
    this.webPageRecord, this.webPageReplay;
    this.https_cert_file = config.certFile;
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
    ]);
    console.log('Stopped WebPageReplay record server');

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
    this.webPageRecord = spawnSync('pkill', [
      '-2',
      '-f',
      'https_port ' + this.httpsPort
    ]);
    console.log('Stopped WebPageReplay replay server');

  }
}

module.exports = WebPageReplay;
