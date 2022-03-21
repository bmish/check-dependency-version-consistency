import {
  compareVersionRanges,
  compareVersionRangesSafe,
  compareRanges,
  versionRangeToRange,
  getLatestVersion,
  getHighestRangeType,
  getIncreasedLatestVersion,
} from '../../lib/semver.js';

describe('Utils | semver', function () {
  describe('#compareVersionRanges', function () {
    it('correctly chooses the higher range', function () {
      // 1 (greater than)
      expect(compareVersionRanges('1.2.3', '1.2.2')).toStrictEqual(1);
      expect(compareVersionRanges('5.0.0', '4.0.0')).toStrictEqual(1);
      expect(compareVersionRanges('8.0.0-beta.1', '^7')).toStrictEqual(1);
      expect(compareVersionRanges('^5.0.0', '4.0.0')).toStrictEqual(1);
      expect(compareVersionRanges('^5.0.0', '^4.0.0')).toStrictEqual(1);
      expect(compareVersionRanges('^5.0.0', '~4.0.0')).toStrictEqual(1);
      expect(compareVersionRanges('^5.0.0', '~5.0.0')).toStrictEqual(1);
      expect(compareVersionRanges('~5.0.0', '5.0.0')).toStrictEqual(1);
      expect(compareVersionRanges('~5.0.0', '~4.0.0')).toStrictEqual(1);

      // -1 (less than)
      expect(compareVersionRanges('4.0.0', '5.0.0')).toStrictEqual(-1);
      expect(compareVersionRanges('5.0.0', '~5.0.0')).toStrictEqual(-1);
      expect(compareVersionRanges('^4.0.0', '^5.0.0')).toStrictEqual(-1);
      expect(compareVersionRanges('~4.0.0', '~5.0.0')).toStrictEqual(-1);
      expect(compareVersionRanges('~5.0.0', '^5.0.0')).toStrictEqual(-1);

      // 0 (equal)
      expect(compareVersionRanges('6', '6')).toStrictEqual(0);
      expect(compareVersionRanges('6.0', '6.0')).toStrictEqual(0);
      expect(compareVersionRanges('6.0.0', '6.0.0')).toStrictEqual(0);
      expect(compareVersionRanges('^6.0.0', '^6.0.0')).toStrictEqual(0);
      expect(compareVersionRanges('v6', '6')).toStrictEqual(0);
      expect(compareVersionRanges('~6.0.0', '~6.0.0')).toStrictEqual(0);
    });

    it('throws with invalid ranges', function () {
      expect(() =>
        compareVersionRanges('foo', '~6.0.0')
      ).toThrowErrorMatchingInlineSnapshot('"Invalid Version: foo"');
      expect(() =>
        compareVersionRanges('~6.0.0', 'foo')
      ).toThrowErrorMatchingInlineSnapshot('"Invalid Version: foo"');
    });
  });

  describe('#compareRanges', function () {
    it('behaves correctly', function () {
      // gt
      expect(compareRanges('^', '~')).toStrictEqual(1);
      expect(compareRanges('^', '')).toStrictEqual(1);
      expect(compareRanges('~', '')).toStrictEqual(1);

      // eq
      expect(compareRanges('', '')).toStrictEqual(0);
      expect(compareRanges('~', '~')).toStrictEqual(0);
      expect(compareRanges('^', '^')).toStrictEqual(0);

      // lt
      expect(compareRanges('', '~')).toStrictEqual(-1);
      expect(compareRanges('', '^')).toStrictEqual(-1);
      expect(compareRanges('~', '^')).toStrictEqual(-1);
    });
  });

  describe('#versionRangeToRange', function () {
    it('behaves correctly', function () {
      expect(versionRangeToRange('>1.0.0')).toStrictEqual('>');
      expect(versionRangeToRange('>=1.0.0')).toStrictEqual('>=');
      expect(versionRangeToRange('^1.0.0')).toStrictEqual('^');
      expect(versionRangeToRange('~1.0.0')).toStrictEqual('~');
      expect(versionRangeToRange('1.0.0')).toStrictEqual('');
    });
  });

  describe('#compareVersionRangesSafe', function () {
    it('behaves correctly', function () {
      expect(compareVersionRangesSafe('1.2.3', '1.2.2')).toStrictEqual(1);
      expect(compareVersionRangesSafe('4.0.0', '5.0.0')).toStrictEqual(-1);
      expect(compareVersionRangesSafe('6', '6')).toStrictEqual(0);
    });

    it('does not throw with invalid ranges', function () {
      expect(compareVersionRangesSafe('foo', '~6.0.0')).toStrictEqual(0);
      expect(compareVersionRangesSafe('~6.0.0', 'foo')).toStrictEqual(0);
    });
  });

  describe('#getLatestVersion', function () {
    it('correctly chooses the higher range', function () {
      // Just basic sanity checks to ensure the data is passed through to `compareVersionRanges` which has extensive tests.
      expect(getLatestVersion(['1.2.3', '1.2.2'])).toStrictEqual('1.2.3');
      expect(getLatestVersion(['1.2.2', '1.2.3'])).toStrictEqual('1.2.3');
    });

    it('throws with invalid version', function () {
      expect(() =>
        getLatestVersion(['1.2.3', 'foo'])
      ).toThrowErrorMatchingInlineSnapshot('"Invalid Version: foo"');
    });
  });

  describe('#getHighestRangeType', function () {
    it('behaves correctly', function () {
      expect(getHighestRangeType(['', ''])).toStrictEqual('');
      expect(getHighestRangeType(['^', ''])).toStrictEqual('^');
      expect(getHighestRangeType(['~', ''])).toStrictEqual('~');
      expect(getHighestRangeType(['~', '^'])).toStrictEqual('^');
      expect(getHighestRangeType(['^', '~'])).toStrictEqual('^');
    });
  });

  describe('#getIncreasedLatestVersion', function () {
    it('behaves correctly', function () {
      // ^
      expect(getIncreasedLatestVersion(['^1.0.0', '1.5.0'])).toStrictEqual(
        '^1.5.0'
      );
      expect(getIncreasedLatestVersion(['1.5.0', '^1.0.0'])).toStrictEqual(
        '^1.5.0'
      );
      expect(getIncreasedLatestVersion(['^0.4.0', '^0.4.5'])).toStrictEqual(
        '^0.4.5'
      );
      expect(getIncreasedLatestVersion(['^0.4.0', '0.5.0'])).toStrictEqual(
        '0.5.0'
      );
      expect(getIncreasedLatestVersion(['^1.0.0', '2.0.0'])).toStrictEqual(
        '2.0.0'
      );
      expect(getIncreasedLatestVersion(['^1.0.0', '^1.0.0'])).toStrictEqual(
        '^1.0.0'
      );

      // ^ ~
      expect(getIncreasedLatestVersion(['~1.5.0', '^1.0.0'])).toStrictEqual(
        '^1.5.0'
      );
      expect(getIncreasedLatestVersion(['~1.5.0', '^2.0.0'])).toStrictEqual(
        '^2.0.0'
      );
      expect(getIncreasedLatestVersion(['~2.0.0', '^1.5.0'])).toStrictEqual(
        '~2.0.0'
      );

      // ~
      expect(getIncreasedLatestVersion(['~1.4.0', '1.4.5'])).toStrictEqual(
        '~1.4.5'
      );
      expect(getIncreasedLatestVersion(['~1.4.0', '~1.5.0'])).toStrictEqual(
        '~1.5.0'
      );
      expect(getIncreasedLatestVersion(['~1.0.0', '~1.0.0'])).toStrictEqual(
        '~1.0.0'
      );

      // no range
      expect(getIncreasedLatestVersion(['1.5.0', '1.0.0'])).toStrictEqual(
        '1.5.0'
      );
      expect(getIncreasedLatestVersion(['1.0.0', '1.0.0'])).toStrictEqual(
        '1.0.0'
      );
    });
  });
});
