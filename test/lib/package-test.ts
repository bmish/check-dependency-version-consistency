import { Package } from '../../lib/package.js';
import {
  FIXTURE_PATH_PACKAGE_MISSING_NAME,
  FIXTURE_PATH_WORKSPACE_PNPM_MISSING_NAME,
  FIXTURE_PATH_WORKSPACE_PNPM_NO_PACKAGES_FIELD,
} from '../fixtures/index.js';
import { join } from 'node:path';

describe('Utils | Package', function () {
  it('throws when package missing name', function () {
    const package_ = new Package(
      join(FIXTURE_PATH_PACKAGE_MISSING_NAME, 'package1'),
      FIXTURE_PATH_PACKAGE_MISSING_NAME,
    );
    expect(() => package_.name).toThrow(
      `${join(
        FIXTURE_PATH_PACKAGE_MISSING_NAME,
        'package1',
        'package.json',
      )} missing \`name\``,
    );
  });

  it('uses (Root) with name-less workspace root package', function () {
    const package_ = new Package(
      FIXTURE_PATH_PACKAGE_MISSING_NAME,
      FIXTURE_PATH_PACKAGE_MISSING_NAME,
    );
    expect(package_.name).toStrictEqual('(Root)');
  });

  it('uses (Root) with name-less workspace root package (pnpm)', function () {
    const package_ = new Package(
      FIXTURE_PATH_WORKSPACE_PNPM_MISSING_NAME,
      FIXTURE_PATH_WORKSPACE_PNPM_MISSING_NAME,
    );
    expect(package_.name).toStrictEqual('(Root)');
  });

  it('handles pnpm-workspace.yaml without packages field', function () {
    const package_ = new Package(
      FIXTURE_PATH_WORKSPACE_PNPM_NO_PACKAGES_FIELD,
      FIXTURE_PATH_WORKSPACE_PNPM_NO_PACKAGES_FIELD,
    );
    expect(package_.workspacePatterns).toStrictEqual([]);
  });
});
