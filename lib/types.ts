import { Package } from './package.js';

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

export enum DEPENDENCY_TYPE {
  'dependencies' = 'dependencies',
  'devDependencies' = 'devDependencies',
  'resolutions' = 'resolutions',
  // TODO: `optionalDependencies`
  // TODO: `peerDependencies`
}

export type Options = {
  depType?: readonly `${DEPENDENCY_TYPE}`[]; // Allow strings so the enum type doesn't always have to be used.
  fix?: boolean;
  ignoreDep?: readonly string[];
  ignoreDepPattern?: readonly string[];
  ignorePackage?: readonly string[];
  ignorePackagePattern?: readonly string[];
  ignorePath?: readonly string[];
  ignorePathPattern?: readonly string[];
};
