import 'mocha'; // eslint-disable-line import/no-unassigned-import -- to get Mocha types to work
import { mismatchingVersionsToOutput } from '../../lib/output.js';
import { strictEqual, throws } from 'node:assert';

describe('Utils | output', function () {
  describe('#mismatchingVersionsToOutputLines', function () {
    it('behaves correctly', function () {
      strictEqual(
        mismatchingVersionsToOutput([
          {
            dependency: 'foo',
            versions: [
              { version: '1.2.3', packages: ['foo'] },
              { version: '4.5.6', packages: ['bar', 'baz'] },
            ],
          },
          {
            dependency: 'bar',
            versions: [
              {
                version: '2.0.0',
                packages: ['package1', 'package2', 'package3', 'package4'],
              },
              {
                version: '1.4.0',
                packages: [
                  'package5',
                  'package6',
                  'package7',
                  'package8',
                  'package9',
                ],
              },
            ],
          },
          {
            dependency: 'baz',
            versions: [
              {
                version: '^2.0.0',
                packages: ['package1'],
              },
              {
                version: '~2.0.0',
                packages: ['package2'],
              },
              {
                version: '^1.0.0',
                packages: ['package3'],
              },
            ],
          },
        ]),
        `Found 3 dependencies with mismatching versions across the workspace.
╔═══════╤════════╤══════════╗
║ \u001B[1mfoo\u001B[22m   │ Usages │ Packages ║
╟───────┼────────┼──────────╢
║ \u001B[91m4.5.6\u001B[39m │ \u001B[1m2\u001B[22m      │ bar, baz ║
╟───────┼────────┼──────────╢
║ \u001B[91m1.2.3\u001B[39m │ 1      │ foo      ║
╚═══════╧════════╧══════════╝
╔═══════╤════════╤════════════════════════════════════════════╗
║ \u001B[1mbar\u001B[22m   │ Usages │ Packages                                   ║
╟───────┼────────┼────────────────────────────────────────────╢
║ \u001B[91m2.0.0\u001B[39m │ 4      │ package1, package2, package3, and 1 other  ║
╟───────┼────────┼────────────────────────────────────────────╢
║ \u001B[91m1.4.0\u001B[39m │ \u001B[1m5\u001B[22m      │ package5, package6, package7, and 2 others ║
╚═══════╧════════╧════════════════════════════════════════════╝
╔════════╤════════╤══════════╗
║ \u001B[1mbaz\u001B[22m    │ Usages │ Packages ║
╟────────┼────────┼──────────╢
║ \u001B[91m^2.0.0\u001B[39m │ 1      │ package1 ║
╟────────┼────────┼──────────╢
║ \u001B[91m~2.0.0\u001B[39m │ 1      │ package2 ║
╟────────┼────────┼──────────╢
║ \u001B[91m^1.0.0\u001B[39m │ 1      │ package3 ║
╚════════╧════════╧══════════╝
`
      );
    });

    it('behaves correctly with empty input', function () {
      throws(
        () => mismatchingVersionsToOutput([]),
        new Error('No mismatching versions to output.')
      );
    });
  });
});
