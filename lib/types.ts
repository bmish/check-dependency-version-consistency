import type { Package } from './package.js';

/** Map of dependency name to information about the dependency. */
export type Dependencies = Record<
  string,
  {
    isFixable: boolean;
    isMismatching: boolean;
    versions: readonly {
      version: string;
      packages: readonly Package[];
    }[];
  }
>;

export const DEPENDENCY_TYPE = {
  dependencies: 'dependencies',
  devDependencies: 'devDependencies',
  optionalDependencies: 'optionalDependencies',
  peerDependencies: 'peerDependencies',
  resolutions: 'resolutions',
} as const;

export type DependencyType =
  (typeof DEPENDENCY_TYPE)[keyof typeof DEPENDENCY_TYPE];

export type Options = {
  depType?: readonly DependencyType[];
  fix?: boolean;
  ignoreDep?: readonly string[];
  ignoreDepPattern?: readonly string[];
  ignorePackage?: readonly string[];
  ignorePackagePattern?: readonly string[];
  ignorePath?: readonly string[];
  ignorePathPattern?: readonly string[];
};
