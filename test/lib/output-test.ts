import {
  FIXTURE_PATH_TESTING_OUTPUT,
  FIXTURE_PATH_NAMES_NOT_MATCHING_LOCATIONS,
  FIXTURE_PATH_INCREASABLE_RANGE,
  FIXTURE_PATH_VALID,
} from '../fixtures/index.js';
import { CDVC } from '../../lib/cdvc.js';

describe('Utils | output', function () {
  describe('#dependenciesToMismatchSummary', function () {
    it('behaves correctly', function () {
      const cdvc = new CDVC(FIXTURE_PATH_TESTING_OUTPUT);
      expect(cdvc.toMismatchSummary()).toMatchInlineSnapshot(`
        "Found 4 dependencies with mismatching versions across the workspace. Fix with \`--fix\`.
        ╔═══════╤════════╤════════════════════════════════════════════╗
        ║ bar   │ Usages │ Packages                                   ║
        ╟───────┼────────┼────────────────────────────────────────────╢
        ║ 2.0.0 │ 4      │ package1, package2, package3, and 1 other  ║
        ╟───────┼────────┼────────────────────────────────────────────╢
        ║ 1.4.0 │ 5      │ package5, package6, package7, and 2 others ║
        ╚═══════╧════════╧════════════════════════════════════════════╝
        ╔════════╤════════╤══════════╗
        ║ baz    │ Usages │ Packages ║
        ╟────────┼────────┼──────────╢
        ║ ^2.0.0 │ 1      │ package1 ║
        ╟────────┼────────┼──────────╢
        ║ ~2.0.0 │ 1      │ package2 ║
        ╟────────┼────────┼──────────╢
        ║ ^1.0.0 │ 1      │ package3 ║
        ╚════════╧════════╧══════════╝
        ╔═════════════╤════════╤══════════╗
        ║ biz         │ Usages │ Packages ║
        ╟─────────────┼────────┼──────────╢
        ║ ^1.0.0      │ 1      │ package1 ║
        ╟─────────────┼────────┼──────────╢
        ║ workspace:* │ 1      │ package2 ║
        ╚═════════════╧════════╧══════════╝
        ╔═══════╤════════╤══════════════════╗
        ║ foo   │ Usages │ Packages         ║
        ╟───────┼────────┼──────────────────╢
        ║ 4.5.6 │ 3      │ (Root), bar, baz ║
        ╟───────┼────────┼──────────────────╢
        ║ 1.2.3 │ 1      │ foo              ║
        ╚═══════╧════════╧══════════════════╝
        "
      `);
    });

    it('behaves correctly when package names do not match locations', function () {
      const cdvc = new CDVC(FIXTURE_PATH_NAMES_NOT_MATCHING_LOCATIONS);
      expect(cdvc.toMismatchSummary()).toMatchInlineSnapshot(`
        "Found 1 dependency with mismatching versions across the workspace. Fix with \`--fix\`.
        ╔═══════╤════════╤══════════════════════════╗
        ║ foo   │ Usages │ Packages                 ║
        ╟───────┼────────┼──────────────────────────╢
        ║ 1.3.0 │ 1      │ misleading-name-package1 ║
        ╟───────┼────────┼──────────────────────────╢
        ║ 1.2.0 │ 1      │ some-workspace-name      ║
        ╚═══════╧════════╧══════════════════════════╝
        "
      `);
    });

    it('behaves correctly with empty input', function () {
      const cdvc = new CDVC(FIXTURE_PATH_VALID);
      expect(() => cdvc.toMismatchSummary()).toThrowErrorMatchingInlineSnapshot(
        '[Error: No mismatching versions to output.]',
      );
    });
  });

  describe('#dependenciesToFixedSummary', function () {
    it('behaves correctly', function () {
      const cdvc = new CDVC(FIXTURE_PATH_TESTING_OUTPUT);
      expect(cdvc.toFixedSummary()).toMatchInlineSnapshot(
        '"Fixed versions for 3 dependencies: bar@2.0.0, baz@^2.0.0, foo@4.5.6"',
      );
    });

    it('behaves correctly with a single fix', function () {
      const cdvc = new CDVC(FIXTURE_PATH_INCREASABLE_RANGE);
      expect(cdvc.toFixedSummary()).toMatchInlineSnapshot(
        '"Fixed versions for 1 dependency: foo@^1.5.0"',
      );
    });

    it('behaves correctly with an increasable range', function () {
      const cdvc = new CDVC(FIXTURE_PATH_INCREASABLE_RANGE);
      expect(cdvc.toFixedSummary()).toMatchInlineSnapshot(
        '"Fixed versions for 1 dependency: foo@^1.5.0"',
      );
    });

    it('behaves correctly with empty input', function () {
      const cdvc = new CDVC(FIXTURE_PATH_VALID);
      expect(() => cdvc.toFixedSummary()).toThrowErrorMatchingInlineSnapshot(
        '[Error: No fixes to output.]',
      );
    });
  });
});
