import { check } from './check.js';
import {
  dependenciesToFixedSummary,
  dependenciesToMismatchSummary,
} from './output.js';
import { Dependencies } from './types.js';

/** Relevant public data about a dependency. */
type Dependency = {
  name: string;
  isFixable: boolean;
  isMismatching: boolean;
  versions: readonly {
    version: string;
    /** Relative path to each package.*/
    packages: readonly string[];
  }[];
};

export class CDVC {
  /** An object mapping each dependency in the workspace to information including the versions found of it. */
  private readonly dependencies: Dependencies;

  /**
   * @param path - path to the workspace root
   * @param options
   * @param options.fix - Whether to autofix inconsistencies (using latest version present)
   * @param options.ignoreDep - Dependency(s) to ignore mismatches for
   * @param options.ignoreDepPattern - RegExp(s) of dependency names to ignore mismatches for
   * @param options.ignorePackage - Workspace package(s) to ignore mismatches for
   * @param options.ignorePackagePattern - RegExp(s) of package names to ignore mismatches for
   * @param options.ignorePath - Workspace-relative path(s) of packages to ignore mismatches for
   * @param options.ignorePathPattern - RegExp(s) of workspace-relative path of packages to ignore mismatches for
   */
  constructor(
    path: string,
    options?: {
      fix?: boolean;
      ignoreDep?: readonly string[];
      ignoreDepPattern?: readonly string[];
      ignorePackage?: readonly string[];
      ignorePackagePattern?: readonly string[];
      ignorePath?: readonly string[];
      ignorePathPattern?: readonly string[];
    }
  ) {
    const { dependencies } = check(path, options);

    this.dependencies = dependencies;
  }

  public toMismatchSummary(): string {
    return dependenciesToMismatchSummary(this.dependencies);
  }

  public toFixedSummary(): string {
    return dependenciesToFixedSummary(this.dependencies);
  }

  public getDependencies(): readonly Dependency[] {
    return Object.keys(this.dependencies).map((dependency) =>
      this.getDependency(dependency)
    );
  }

  public getDependency(name: string): Dependency {
    // Convert underlying dependency data object with relevant public data.
    return {
      name,
      isFixable: this.dependencies[name].isFixable,
      isMismatching: this.dependencies[name].isMismatching,
      versions: this.dependencies[name].versions.map((version) => ({
        version: version.version,
        packages: version.packages.map((package_) => package_.pathRelative),
      })),
    };
  }

  public get hasMismatchingDependencies(): boolean {
    return Object.values(this.dependencies).some((dep) => dep.isMismatching);
  }

  public get hasMismatchingDependenciesFixable(): boolean {
    return Object.values(this.dependencies).some(
      (dep) => dep.isMismatching && dep.isFixable
    );
  }

  public get hasMismatchingDependenciesNotFixable(): boolean {
    return Object.values(this.dependencies).some(
      (dep) => dep.isMismatching && !dep.isFixable
    );
  }
}
