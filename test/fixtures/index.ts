import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIXTURE_PATH = join(__dirname, '..', '/fixtures');

export const FIXTURE_PATH_VALID = join(FIXTURE_PATH, 'valid');
export const FIXTURE_PATH_INCONSISTENT_VERSIONS = join(
  FIXTURE_PATH,
  'inconsistent-versions',
);
export const FIXTURE_PATH_NO_DEPENDENCIES = join(
  FIXTURE_PATH,
  'no-dependencies',
);
export const FIXTURE_PATH_NO_PACKAGES = join(FIXTURE_PATH, 'no-packages');
export const FIXTURE_PATH_NOT_A_WORKSPACE = join(
  FIXTURE_PATH,
  'not-a-workspace',
);
export const FIXTURE_PATH_NO_PACKAGE_JSON = join(
  FIXTURE_PATH,
  'no-package-json',
);
export const FIXTURE_PATH_PACKAGE_MISSING_PACKAGE_JSON = join(
  FIXTURE_PATH,
  'package-missing-package-json',
);
export const FIXTURE_PATH_TESTING_OUTPUT = join(FIXTURE_PATH, 'testing-output');
export const FIXTURE_PATH_NAMES_NOT_MATCHING_LOCATIONS = join(
  FIXTURE_PATH,
  'names-not-matching-locations',
);
export const FIXTURE_PATH_WORKSPACE_NOT_AN_ARRAY = join(
  FIXTURE_PATH,
  'workspace-not-an-array',
);
export const FIXTURE_PATH_PACKAGE_MISSING_NAME = join(
  FIXTURE_PATH,
  'package-missing-name',
);
export const FIXTURE_PATH_WORKSPACE_PNPM_MISSING_NAME = join(
  FIXTURE_PATH,
  'workspace-pnpm-missing-name',
);
export const FIXTURE_PATH_INCONSISTENT_LOCAL_PACKAGE_VERSION = join(
  FIXTURE_PATH,
  'inconsistent-local-package-version',
);
export const FIXTURE_PATH_INCREASABLE_RANGE = join(
  FIXTURE_PATH,
  'increasable-range',
);
export const FIXTURE_PATH_VALID_WITH_COMMENTS = join(
  FIXTURE_PATH,
  'valid-with-comments',
);
export const FIXTURE_PATH_VALID_WITH_PACKAGES = join(
  FIXTURE_PATH,
  'valid-with-packages',
);
export const FIXTURE_PATH_VALID_NOHOIST_WITH_NODE_MODULES = join(
  FIXTURE_PATH,
  'valid-nohoist-with-node-modules',
);
export const FIXTURE_PATH_WORKSPACE_PACKAGE_NOT_AN_ARRAY = join(
  FIXTURE_PATH,
  'workspace-packages-not-an-array',
);
export const FIXTURE_PATH_WORKSPACE_PNPM = join(FIXTURE_PATH, 'workspace-pnpm');
export const FIXTURE_PATH_WORKSPACE_PNPM_PACKAGES_WRONG_TYPE = join(
  FIXTURE_PATH,
  'workspace-pnpm-packages-wrong-type',
);
export const FIXTURE_PATH_NESTED_WORKSPACES = join(
  FIXTURE_PATH,
  'nested-workspaces',
);
export const FIXTURE_PATH_RESOLUTIONS = join(FIXTURE_PATH, 'resolutions');
export const FIXTURE_PATH_PEER_DEPENDENCIES = join(
  FIXTURE_PATH,
  'peer-dependencies',
);
export const FIXTURE_PATH_OPTIONAL_DEPENDENCIES = join(
  FIXTURE_PATH,
  'optional-dependencies',
);

export const FIXTURE_PATH_ALL_VERSION_TYPES = join(
  FIXTURE_PATH,
  'all-version-types',
);

export const FIXTURE_PATH_VALID_WITH_WORKSPACE_PREFIX = join(
  FIXTURE_PATH,
  'valid-with-workspace-prefix',
);

export const FIXTURE_PATH_INCONSISTENT_WITH_WORKSPACE_PREFIX = join(
  FIXTURE_PATH,
  'inconsistent-with-workspace-prefix',
);
