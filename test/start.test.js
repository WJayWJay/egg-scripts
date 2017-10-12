'use strict';

const path = require('path');
const assert = require('assert');
const fs = require('mz/fs');
const sleep = require('mz-modules/sleep');
const rimraf = require('mz-modules/rimraf');
const mkdirp = require('mz-modules/mkdirp');
const coffee = require('coffee');
const httpclient = require('urllib');
const mm = require('mm');
const utils = require('./utils');

describe('test/start.test.js', () => {
  const eggBin = require.resolve('../bin/egg-scripts.js');
  const fixturePath = path.join(__dirname, 'fixtures/example');
  const homePath = path.join(__dirname, 'fixtures/home');
  const logDir = path.join(homePath, 'logs');
  const waitTime = '10s';

  before(function* () {
    yield mkdirp(homePath);
  });
  after(function* () {
    yield rimraf(homePath);
  });
  beforeEach(() => mm(process.env, 'MOCK_HOME_DIR', homePath));
  afterEach(() => mm.restore);

  describe('start without daemon', () => {
    describe('full path', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--workers=2', fixturePath ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.includes('--title=egg-server-example'));
        assert(app.stdout.includes('"title":"egg-server-example"'));
        assert(app.stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7001/));
        assert(app.stdout.includes('app_worker#2:'));
        assert(!app.stdout.includes('app_worker#3:'));
        const result = yield httpclient.request('http://127.0.0.1:7001');
        assert(result.data.toString() === 'hi, egg');
      });
    });

    describe('relative path', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--workers=2', path.relative(process.cwd(), fixturePath) ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7001/));
        const result = yield httpclient.request('http://127.0.0.1:7001');
        assert(result.data.toString() === 'hi, egg');
      });
    });

    describe('without baseDir', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--workers=2' ], { cwd: fixturePath });
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7001/));
        const result = yield httpclient.request('http://127.0.0.1:7001');
        assert(result.data.toString() === 'hi, egg');
      });
    });

    describe('--framework', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--framework=yadan', '--workers=2', fixturePath ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.match(/yadan started on http:\/\/127\.0\.0\.1:7001/));
        const result = yield httpclient.request('http://127.0.0.1:7001');
        assert(result.data.toString() === 'hi, yadan');
      });
    });

    describe('--title', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--workers=2', '--title=egg-test', fixturePath ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.includes('--title=egg-test'));
        assert(app.stdout.includes('"title":"egg-test"'));
        assert(app.stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7001/));
        assert(app.stdout.includes('app_worker#2:'));
        assert(!app.stdout.includes('app_worker#3:'));
        const result = yield httpclient.request('http://127.0.0.1:7001');
        assert(result.data.toString() === 'hi, egg');
      });
    });

    describe('--port', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--port=7002', '--workers=2', fixturePath ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7002/));
        const result = yield httpclient.request('http://127.0.0.1:7002');
        assert(result.data.toString() === 'hi, egg');
      });
    });

    describe('process.env.PORT', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--workers=2', fixturePath ], { env: Object.assign({}, process.env, { PORT: 7002 }) });
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7002/));
        const result = yield httpclient.request('http://127.0.0.1:7002');
        assert(result.data.toString() === 'hi, egg');
      });
    });

    describe('--env', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--workers=2', '--env=pre', fixturePath ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7001/));
        const result = yield httpclient.request('http://127.0.0.1:7001/env');
        assert(result.data.toString() === 'pre, true');
      });
    });

    describe('custom env', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        mm(process.env, 'CUSTOM_ENV', 'pre');
        app = coffee.fork(eggBin, [ 'start', '--workers=2', fixturePath ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.includes('## EGG_SERVER_ENV is not pass'));
        assert(app.stdout.includes('## CUSTOM_ENV: pre'));
        assert(app.stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7001/));
        let result = yield httpclient.request('http://127.0.0.1:7001/env');
        assert(result.data.toString() === 'pre, true');
        result = yield httpclient.request('http://127.0.0.1:7001/path');
        assert(result.data.toString().match(new RegExp(`^${fixturePath}/node_modules/.bin${path.delimiter}`)));
      });
    });

    describe('--stdout --stderr', () => {
      let app;

      before(function* () {
        yield utils.cleanup(fixturePath);
        yield rimraf(logDir);
        yield mkdirp(logDir);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
        yield rimraf(path.join(fixturePath, 'stdout.log'));
        yield rimraf(path.join(fixturePath, 'stderr.log'));
      });

      it('should start', function* () {
        const stdout = path.join(fixturePath, 'stdout.log');
        const stderr = path.join(fixturePath, 'stderr.log');
        app = coffee.fork(eggBin, [ 'start', '--workers=1', '--daemon', `--stdout=${stdout}`, `--stderr=${stderr}`, fixturePath ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        let content = yield fs.readFile(stdout, 'utf-8');
        assert(content.match(/custom-framework started on http:\/\/127\.0\.0\.1:7001/));

        content = yield fs.readFile(stderr, 'utf-8');
        assert(content === '');
      });
    });

    describe('read cluster config', () => {
      let app;
      const fixturePath = path.join(__dirname, 'fixtures/cluster-config');

      before(function* () {
        yield utils.cleanup(fixturePath);
      });

      after(function* () {
        app.proc.kill('SIGTERM');
        yield utils.cleanup(fixturePath);
      });

      it('should start', function* () {
        app = coffee.fork(eggBin, [ 'start', '--workers=2', fixturePath ]);
        // app.debug();
        app.expect('code', 0);

        yield sleep(waitTime);

        assert(app.stderr === '');
        assert(app.stdout.match(/egg started on http:\/\/127\.0\.0\.1:8000/));
        assert(!app.stdout.includes('app_worker#3:'));
        const result = yield httpclient.request('http://127.0.0.1:8000');
        assert(result.data.toString() === 'hi, egg');
      });
    });
  });

  describe('start with daemon', () => {
    let app;

    before(function* () {
      yield utils.cleanup(fixturePath);
      yield rimraf(logDir);
      yield mkdirp(logDir);
      yield fs.writeFile(path.join(logDir, 'master-stdout.log'), 'just for test');
      yield fs.writeFile(path.join(logDir, 'master-stderr.log'), 'just for test');
    });

    after(function* () {
      app.proc.kill('SIGTERM');
      yield utils.cleanup(fixturePath);
    });

    it('should start', function* () {
      app = coffee.fork(eggBin, [ 'start', '--daemon', '--workers=2', '--port=7002', fixturePath ]);
      // app.debug();
      app.expect('code', 0);

      yield sleep(waitTime);

      assert(app.stdout.match(/starting egg.*example/));
      assert(app.stdout.match(/egg started on http:\/\/127\.0\.0\.1:7002/));

      // master log
      const stdout = yield fs.readFile(path.join(logDir, 'master-stdout.log'), 'utf-8');
      const stderr = yield fs.readFile(path.join(logDir, 'master-stderr.log'), 'utf-8');
      assert(stderr === '');
      assert(stdout.match(/custom-framework started on http:\/\/127\.0\.0\.1:7002/));

      // should rotate log
      const fileList = yield fs.readdir(logDir);
      assert(fileList.some(name => name.match(/master-stdout\.log\.\d+\.\d+/)));
      assert(fileList.some(name => name.match(/master-stderr\.log\.\d+\.\d+/)));

      const result = yield httpclient.request('http://127.0.0.1:7002');
      assert(result.data.toString() === 'hi, egg');
    });
  });

});
