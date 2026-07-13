import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import mockFs from 'mock-fs';
import { run } from '../../lib/cli.js';
import {
  FIXTURE_PATH_INCONSISTENT_VERSIONS,
  FIXTURE_PATH_TESTING_OUTPUT,
  FIXTURE_PATH_VALID,
} from '../fixtures/index.js';

const REPO_PACKAGE_JSON_PATH = join(process.cwd(), 'package.json');
const REPO_PACKAGE_JSON = readFileSync(REPO_PACKAGE_JSON_PATH, 'utf8');
const REPO_PACKAGE_VERSION = (
  JSON.parse(REPO_PACKAGE_JSON) as { version: string }
).version;
const MOCK_WORKSPACE_PATH = '/mock-workspace';

// Paths getCurrentPackageVersion resolves under vitest (source lib/, not dist/lib/).
const CLI_DIR = join(process.cwd(), 'lib');
const DISTRIBUTION_RELATIVE_PACKAGE_JSON = join(
  CLI_DIR,
  '..',
  '..',
  'package.json',
);
const SOURCE_RELATIVE_PACKAGE_JSON = join(CLI_DIR, '..', 'package.json');

/** mockFs that keeps the real package.json readable for getCurrentPackageVersion. */
function mockWorkspaceFromFixture(fixturePath: string) {
  // Pre-read fixture + repo package.json before mocking so writes stay in the mock FS.
  mockFs({
    [REPO_PACKAGE_JSON_PATH]: REPO_PACKAGE_JSON,
    [MOCK_WORKSPACE_PATH]: mockFs.load(fixturePath),
  });
}

function spyVersionExit() {
  const exitSpy = vi.spyOn(process, 'exit').mockImplementation((code) => {
    throw new Error(`process.exit(${String(code)})`);
  });
  const stdoutWriteSpy = vi
    .spyOn(process.stdout, 'write')
    .mockImplementation(() => true);
  return { exitSpy, stdoutWriteSpy };
}

describe('cli', function () {
  let consoleLogSpy: MockInstance<typeof console.log>;

  beforeEach(function () {
    consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
  });

  afterEach(function () {
    consoleLogSpy.mockRestore();
    process.exitCode = undefined;
    mockFs.restore();
    vi.restoreAllMocks();
  });

  describe('valid fixture', function () {
    it('produces no output and leaves exitCode unset', function () {
      run(['node', 'cdvc.js', FIXTURE_PATH_VALID]);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(process.exitCode).toBeUndefined();
    });
  });

  describe('inconsistent-versions fixture', function () {
    it('prints a mismatch summary and sets exitCode 1', function () {
      run(['node', 'cdvc.js', FIXTURE_PATH_INCONSISTENT_VERSIONS]);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain(
        'Found 2 dependencies with mismatching versions',
      );
      expect(process.exitCode).toBe(1);
    });
  });

  describe('option plumbing', function () {
    it('accepts repeated --dep-type and CSV form', function () {
      run([
        'node',
        'cdvc.js',
        FIXTURE_PATH_INCONSISTENT_VERSIONS,
        '--dep-type',
        'dependencies',
        '--dep-type',
        'devDependencies,optionalDependencies',
      ]);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(process.exitCode).toBe(1);
    });

    it('accepts repeated --ignore-dep', function () {
      run([
        'node',
        'cdvc.js',
        FIXTURE_PATH_INCONSISTENT_VERSIONS,
        '--ignore-dep',
        'foo',
        '--ignore-dep',
        'baz',
      ]);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(process.exitCode).toBeUndefined();
    });

    it('throws on invalid --dep-type', function () {
      expect(() =>
        run([
          'node',
          'cdvc.js',
          FIXTURE_PATH_INCONSISTENT_VERSIONS,
          '--dep-type',
          'fake',
        ]),
      ).toThrow(
        'Invalid depType provided. Choices are: dependencies, devDependencies, optionalDependencies, peerDependencies, resolutions.',
      );
    });
  });

  describe('--fix', function () {
    it('prints a fixed summary and leaves exitCode unset when all mismatches are fixable', function () {
      mockWorkspaceFromFixture(FIXTURE_PATH_INCONSISTENT_VERSIONS);

      run(['node', 'cdvc.js', MOCK_WORKSPACE_PATH, '--fix']);

      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('Fixed versions for');
      expect(process.exitCode).toBeUndefined();
    });

    it('prints fixed and remaining mismatch summaries and sets exitCode 1 when some are not fixable', function () {
      mockWorkspaceFromFixture(FIXTURE_PATH_TESTING_OUTPUT);

      run(['node', 'cdvc.js', MOCK_WORKSPACE_PATH, '--fix']);

      expect(consoleLogSpy).toHaveBeenCalledTimes(2);
      expect(consoleLogSpy.mock.calls[0]?.[0]).toContain('Fixed versions for');
      expect(consoleLogSpy.mock.calls[1]?.[0]).toContain(
        'with mismatching versions',
      );
      expect(process.exitCode).toBe(1);
    });

    it('produces no output when there is nothing to fix', function () {
      run(['node', 'cdvc.js', FIXTURE_PATH_VALID, '--fix']);

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(process.exitCode).toBeUndefined();
    });
  });

  describe('--version', function () {
    it('prints the package version via getCurrentPackageVersion', function () {
      const { exitSpy, stdoutWriteSpy } = spyVersionExit();

      expect(() => run(['node', 'cdvc.js', '--version'])).toThrow(
        /process\.exit/,
      );

      const written = stdoutWriteSpy.mock.calls
        .map((call) => String(call[0]))
        .join('');
      expect(written).toContain(REPO_PACKAGE_VERSION);
      expect(exitSpy).toHaveBeenCalled();
    });

    it('prefers the dist-relative package.json when it exists', function () {
      mockFs({
        [DISTRIBUTION_RELATIVE_PACKAGE_JSON]: JSON.stringify({
          version: '9.9.9',
        }),
        [SOURCE_RELATIVE_PACKAGE_JSON]: JSON.stringify({
          version: REPO_PACKAGE_VERSION,
        }),
      });
      const { stdoutWriteSpy } = spyVersionExit();

      expect(() => run(['node', 'cdvc.js', '--version'])).toThrow(
        /process\.exit/,
      );

      const written = stdoutWriteSpy.mock.calls
        .map((call) => String(call[0]))
        .join('');
      expect(written).toContain('9.9.9');
    });

    it('throws when package.json has no version', function () {
      mockFs({
        [SOURCE_RELATIVE_PACKAGE_JSON]: JSON.stringify({ name: 'no-version' }),
      });

      expect(() => run(['node', 'cdvc.js', '--version'])).toThrow(
        'Could not find package.json `version`',
      );
    });
  });
});
