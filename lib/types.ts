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

export type Options = {
  fix?: boolean;
  ignoreDep?: readonly string[];
  ignoreDepPattern?: readonly string[];
  ignorePackage?: readonly string[];
  ignorePackagePattern?: readonly string[];
  ignorePath?: readonly string[];
  ignorePathPattern?: readonly string[];
};
