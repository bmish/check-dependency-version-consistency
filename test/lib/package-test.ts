import { Package } from '../../lib/package.js';
import { FIXTURE_PATH_PACKAGE_MISSING_NAME } from '../fixtures/index.js';
import { join } from 'node:path';

describe('Utils | Package', function () {
  it('throws when package missing name ', function () {
    const package_ = new Package(
      join(FIXTURE_PATH_PACKAGE_MISSING_NAME, 'package1')
    );
    expect(() => package_.name).toThrowError(
      `${join(
        FIXTURE_PATH_PACKAGE_MISSING_NAME,
        'package1',
        'package.json'
      )} missing \`name\``
    );
  });
});
