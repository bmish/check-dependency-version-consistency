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
