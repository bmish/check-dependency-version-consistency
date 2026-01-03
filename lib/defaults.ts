import { DEPENDENCY_TYPE } from './types.js';
import type { DependencyType } from './types.js';

export const DEFAULT_DEP_TYPES: DependencyType[] = [
  DEPENDENCY_TYPE.dependencies,
  DEPENDENCY_TYPE.devDependencies,
  DEPENDENCY_TYPE.optionalDependencies,
  DEPENDENCY_TYPE.resolutions,
  // peerDependencies is not included by default, see discussion in: https://github.com/bmish/check-dependency-version-consistency/issues/402
];
