import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PackageJson } from 'type-fest';
import { load } from 'js-yaml';

/*
 * Class to represent all of the information we need to know about a package in a workspace.
 */
export class Package {
  /** Absolute path to package */
  path: string;
  /** Absolute path to workspace.*/
  pathWorkspace: string;
  /** Absolute path to package.json. */
  pathPackageJson: string;
  packageJson: PackageJson;
  packageJsonEndsInNewline: boolean;
  pnpmWorkspacePackages?: readonly string[];

  constructor(path: string, pathWorkspace: string) {
    this.path = path;
    this.pathWorkspace = pathWorkspace;

    // package.json
    this.pathPackageJson = join(path, 'package.json');
    const packageJsonContents = readFileSync(this.pathPackageJson, 'utf8');
    this.packageJsonEndsInNewline = packageJsonContents.endsWith('\n');
    this.packageJson = JSON.parse(packageJsonContents) as PackageJson;

    // pnpm-workspace.yaml
    const pnpmWorkspacePath = join(path, 'pnpm-workspace.yaml');
    if (existsSync(pnpmWorkspacePath)) {
      const pnpmWorkspaceContents = readFileSync(pnpmWorkspacePath, 'utf8');
      const pnpmWorkspaceYaml = load(pnpmWorkspaceContents) as {
        packages?: readonly string[];
      };
      this.pnpmWorkspacePackages = pnpmWorkspaceYaml.packages;
    }
  }

  get name(): string {
    if (this.workspacePatterns.length > 0 && !this.packageJson.name) {
      return '(Root)';
    }
    if (!this.packageJson.name) {
      throw new Error(`${this.pathPackageJson} missing \`name\``);
    }
    return this.packageJson.name;
  }

  /** Relative to workspace root. */
  get pathRelative(): string {
    return relative(this.pathWorkspace, this.path);
  }

  get workspacePatterns(): readonly string[] {
    if (this.packageJson.workspaces) {
      if (Array.isArray(this.packageJson.workspaces)) {
        return this.packageJson.workspaces;
      } else if (this.packageJson.workspaces.packages) {
        if (!Array.isArray(this.packageJson.workspaces.packages)) {
          throw new TypeError(
            'package.json `workspaces.packages` is not a string array.'
          );
        }
        return this.packageJson.workspaces.packages;
      } else {
        throw new TypeError('package.json `workspaces` is not a string array.');
      }
    }

    if (this.pnpmWorkspacePackages) {
      // eslint-disable-next-line unicorn/no-instanceof-array -- using Array.isArray() loses type information about the array.
      if (!(this.pnpmWorkspacePackages instanceof Array)) {
        throw new TypeError(
          'pnpm-workspace.yaml `packages` is not a string array.'
        );
      }
      return this.pnpmWorkspacePackages;
    }

    return [];
  }

  static exists(path: string): boolean {
    const packageJsonPath = join(path, 'package.json');
    return existsSync(packageJsonPath);
  }

  static some(
    packages: readonly Package[],
    callback: (package_: Package) => boolean
  ): boolean {
    return packages.some((package_) => callback(package_));
  }

  static comparator(package1: Package, package2: Package) {
    return package1.name.localeCompare(package2.name);
  }
}
