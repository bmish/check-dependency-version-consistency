import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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
export const FIXTURE_PATH_TESTING_OUTPUT = join(FIXTURE_PATH, 'testing-output');
export const FIXTURE_PATH_NAMES_NOT_MATCHING_LOCATIONS = join(
  FIXTURE_PATH,
  'names-not-matching-locations'
);
export const FIXTURE_PATH_WORKSPACE_NOT_AN_ARRAY = join(
  FIXTURE_PATH,
  'workspace-not-an-array'
);
export const FIXTURE_PATH_PACKAGE_MISSING_NAME = join(
  FIXTURE_PATH,
  'package-missing-name'
);
export const FIXTURE_PATH_INCONSISTENT_LOCAL_PACKAGE_VERSION = join(
  FIXTURE_PATH,
  'inconsistent-local-package-version'
);
export const FIXTURE_PATH_INCREASABLE_RANGE = join(
  FIXTURE_PATH,
  'increasable-range'
);
