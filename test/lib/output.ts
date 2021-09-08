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
              { version: '1.2.3', count: 1 },
              { version: '4.5.6', count: 2 },
            ],
          },
          {
            dependency: 'bar',
            versions: [
              { version: '2.0.0', count: 4 },
              { version: '1.4.0', count: 3 },
            ],
          },
          {
            dependency: 'baz',
            versions: [
              { version: '^2.0.0', count: 1 },
              { version: '~2.0.0', count: 1 },
              { version: '^1.0.0', count: 1 },
            ],
          },
        ]),
        `Found 3 dependencies with mismatching versions across the workspace.
╔═══════╤════════╗
║ \u001B[1mfoo\u001B[22m   │ Usages ║
╟───────┼────────╢
║ \u001B[91m1.2.3\u001B[39m │ 1      ║
╟───────┼────────╢
║ \u001B[91m4.5.6\u001B[39m │ 2      ║
╚═══════╧════════╝
╔═══════╤════════╗
║ \u001B[1mbar\u001B[22m   │ Usages ║
╟───────┼────────╢
║ \u001B[91m1.4.0\u001B[39m │ 3      ║
╟───────┼────────╢
║ \u001B[91m2.0.0\u001B[39m │ 4      ║
╚═══════╧════════╝
╔════════╤════════╗
║ \u001B[1mbaz\u001B[22m    │ Usages ║
╟────────┼────────╢
║ \u001B[91m^1.0.0\u001B[39m │ 1      ║
╟────────┼────────╢
║ \u001B[91m~2.0.0\u001B[39m │ 1      ║
╟────────┼────────╢
║ \u001B[91m^2.0.0\u001B[39m │ 1      ║
╚════════╧════════╝
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
