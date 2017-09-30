'use strict';

const { spawn } = require('child_process');

class WebPageReplay {
  constructor(config) {
    this.webPageReplayPath =
      config.webPageReplayPath ||
      '/Users/phedenskog/go/src/github.com/catapult-project/catapult/web_page_replay_go';
    this.httpPort = config.httpPort || 8080;
    this.httpsPort = config.httpsPort || 8081;
    this.pathToArchiveFile = config.pathToArchiveFile || '/tmp/archive.wprgo';
    this.webPageRecord, this.webPageReplay;
  }

  startRecord() {
    // The current version of WebPageReplay doesn't give any error
    // if the port is already busy

    const currentDir = process.cwd();
    process.chdir(this.webPageReplayPath);

    this.webPageRecord = spawn(
      'go',
      [
        'run',
        'src/wpr.go',
        'record',
        '--http_port',
        this.httpPort,
        '--https_port',
        this.httpsPort,
        this.pathToArchiveFile
      ],
      {
        detached: true,
        stdio: 'ignore'
      }
    );

    process.chdir(currentDir);
    this.webPageRecord.unref();
  }

  stopRecord() {
    // Super simple kill at the moment,
    // we can make this better in the future
    this.webPageRecord = spawn('pkill', [
      '-2',
      '-f',
      'https_port ' + this.httpsPort
    ]);
  }

  startReplay() {
    const currentDir = process.cwd();
    process.chdir(this.webPageReplayPath);

    this.webPageReplay = spawn(
      'go',
      [
        'run',
        'src/wpr.go',
        'replay',
        '--http_port',
        this.httpPort,
        '--https_port',
        this.httpsPort,
        this.pathToArchiveFile
      ],
      {
        detached: true,
        stdio: 'ignore'
      }
    );
    process.chdir(currentDir);
    this.webPageReplay.unref();
  }

  stopReplay() {
    this.stopRecord();
  }
}

module.exports = WebPageReplay;
