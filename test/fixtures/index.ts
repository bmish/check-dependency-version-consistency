import { join } from 'path';

const FIXTURE_PATH = join(__dirname, '..', '/fixtures');

export const FIXTURE_PATH_VALID = join(FIXTURE_PATH, 'valid');
export const FIXTURE_PATH_INCONSISTENT_VERSIONS = join(
  FIXTURE_PATH,
  'inconsistent-versions'
);
export const FIXTURE_PATH_NO_DEPENDENCIES = join(
  FIXTURE_PATH,
  'no-dependencies'
);
export const FIXTURE_PATH_NO_PACKAGES = join(FIXTURE_PATH, 'no-packages');
export const FIXTURE_PATH_NOT_A_WORKSPACE = join(
  FIXTURE_PATH,
  'not-a-workspace'
);
export const FIXTURE_PATH_NO_PACKAGE_JSON = join(
  FIXTURE_PATH,
  'no-package-json'
);
export const FIXTURE_PATH_PACKAGE_MISSING_PACKAGE_JSON = join(
  FIXTURE_PATH,
  'package-missing-package-json'
);
