import {
  calculateVersionsForEachDependency,
  calculateMismatchingVersions,
} from '../../lib/dependency-versions.js';
import { mismatchingVersionsToOutput } from '../../lib/output.js';
import { getPackages } from '../../lib/workspace.js';
import {
  FIXTURE_PATH_TESTING_OUTPUT,
  FIXTURE_PATH_NAMES_NOT_MATCHING_LOCATIONS,
} from '../fixtures/index.js';

describe('Utils | output', function () {
  describe('#mismatchingVersionsToOutputLines', function () {
    it('behaves correctly', function () {
      expect(
        mismatchingVersionsToOutput(
          calculateMismatchingVersions(
            calculateVersionsForEachDependency(
              getPackages(FIXTURE_PATH_TESTING_OUTPUT, [], [], [], [])
            )
          )
        )
      ).toMatchInlineSnapshot(`
        "Found 4 dependencies with mismatching versions across the workspace. Upgrade all to latest present version with \`--fix\`.
        ╔═══════╤════════╤════════════════════════════════════════════╗
        ║ [1mbar[22m   │ Usages │ Packages                                   ║
        ╟───────┼────────┼────────────────────────────────────────────╢
        ║ [91m2.0.0[39m │ 4      │ package1, package2, package3, and 1 other  ║
        ╟───────┼────────┼────────────────────────────────────────────╢
        ║ [91m1.4.0[39m │ [1m5[22m      │ package5, package6, package7, and 2 others ║
        ╚═══════╧════════╧════════════════════════════════════════════╝
        ╔════════╤════════╤══════════╗
        ║ [1mbaz[22m    │ Usages │ Packages ║
        ╟────────┼────────┼──────────╢
        ║ [91m^2.0.0[39m │ 1      │ package1 ║
        ╟────────┼────────┼──────────╢
        ║ [91m~2.0.0[39m │ 1      │ package2 ║
        ╟────────┼────────┼──────────╢
        ║ [91m^1.0.0[39m │ 1      │ package3 ║
        ╚════════╧════════╧══════════╝
        ╔═════════════╤════════╤══════════╗
        ║ [1mbiz[22m         │ Usages │ Packages ║
        ╟─────────────┼────────┼──────────╢
        ║ [91m^1.0.0[39m      │ 1      │ package1 ║
        ╟─────────────┼────────┼──────────╢
        ║ [91mworkspace:*[39m │ 1      │ package2 ║
        ╚═════════════╧════════╧══════════╝
        ╔═══════╤════════╤══════════════════╗
        ║ [1mfoo[22m   │ Usages │ Packages         ║
        ╟───────┼────────┼──────────────────╢
        ║ [91m4.5.6[39m │ [1m3[22m      │ (Root), bar, baz ║
        ╟───────┼────────┼──────────────────╢
        ║ [91m1.2.3[39m │ 1      │ foo              ║
        ╚═══════╧════════╧══════════════════╝
        "
      `);
    });

    it('behaves correctly when package names do not match locations', function () {
      expect(
        mismatchingVersionsToOutput(
          calculateMismatchingVersions(
            calculateVersionsForEachDependency(
              getPackages(
                FIXTURE_PATH_NAMES_NOT_MATCHING_LOCATIONS,
                [],
                [],
                [],
                []
              )
            )
          )
        )
      ).toMatchInlineSnapshot(`
        "Found 1 dependency with mismatching versions across the workspace. Upgrade all to latest present version with \`--fix\`.
        ╔═══════╤════════╤══════════════════════════╗
        ║ [1mfoo[22m   │ Usages │ Packages                 ║
        ╟───────┼────────┼──────────────────────────╢
        ║ [91m1.3.0[39m │ 1      │ misleading-name-package1 ║
        ╟───────┼────────┼──────────────────────────╢
        ║ [91m1.2.0[39m │ 1      │ some-workspace-name      ║
        ╚═══════╧════════╧══════════════════════════╝
        "
      `);
    });

    it('behaves correctly with empty input', function () {
      expect(() =>
        mismatchingVersionsToOutput([])
      ).toThrowErrorMatchingInlineSnapshot(
        '"No mismatching versions to output."'
      );
    });
  });
});
