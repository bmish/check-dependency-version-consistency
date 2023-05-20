import { run } from '../../lib/cli.js';
import sinon from 'sinon';
import mockFs from 'mock-fs';

describe('cli', function () {
  describe('no options', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'my-workspace',
          main: 'index.js',
          workspaces: ['*'],
        }),
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('is called correctly', async function () {
      const consoleStub = sinon.stub(console, 'log');

      await run([
        'node', // Path to node.
        'check-dependency-version-consistency.js', // Path to this binary.
      ]);

      expect(consoleStub.callCount).toBe(1);
      expect(consoleStub.firstCall.args).toMatchSnapshot();

      consoleStub.restore();
    });
  });

  describe('with fix CLI option', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'my-workspace',
          main: 'index.js',
          workspaces: ['*'],
        }),
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('is called correctly', async function () {
      const consoleStub = sinon.stub(console, 'log');

      await run([
        'node', // Path to node.
        'check-dependency-version-consistency.js', // Path to this binary.

        '--fix',
      ]);

      expect(consoleStub.callCount).toBe(1);
      expect(consoleStub.firstCall.args).toMatchSnapshot();

      consoleStub.restore();
    });
  });

  describe('missing package.json `workspaces` field', function () {
    beforeEach(function () {
      mockFs({
        'package.json': JSON.stringify({
          name: 'my-workspace',
          main: 'index.js',
        }),
      });
    });

    afterEach(function () {
      mockFs.restore();
    });

    it('throws an error', async function () {
      const consoleStub = sinon.stub(console, 'log');

      await expect(
        run([
          'node', // Path to node.
          'check-dependency-version-consistency.js', // Path to this binary.
        ])
      ).rejects.toThrow('Could not find package.json `workspaces`.');

      expect(consoleStub.callCount).toBe(0);
    });
  });
});
