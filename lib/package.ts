import { existsSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { PackageJson } from 'type-fest';

// Class to represent all of the information we need to know about a package in a workspace.
export class Package {
  path: string; // Absolute path to package.
  pathWorkspace: string; // Absolute path to workspace.
  pathPackageJson: string; // Absolute path to package.json.
  packageJson: PackageJson;
  packageJsonEndsInNewline: boolean;

  constructor(path: string, pathWorkspace: string) {
    this.path = path;
    this.pathWorkspace = pathWorkspace;
    this.pathPackageJson = join(path, 'package.json');
    const packageJsonContents = readFileSync(this.pathPackageJson, 'utf8');
    this.packageJsonEndsInNewline = packageJsonContents.endsWith('\n');
    this.packageJson = JSON.parse(packageJsonContents);
  }

  get name() {
    if (this.packageJson.workspaces && !this.packageJson.name) {
      return '(Root)';
    }
    if (!this.packageJson.name) {
      throw new Error(`${this.pathPackageJson} missing \`name\``);
    }
    return this.packageJson.name;
  }

  // Relative to workspace root.
  get pathRelative() {
    return relative(this.pathWorkspace, this.path);
  }

  get workspacePatterns(): string[] {
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
    return [];
  }

  static exists(path: string) {
    const packageJsonPath = join(path, 'package.json');
    return existsSync(packageJsonPath);
  }

  static some(packages: Package[], callback: (package_: Package) => boolean) {
    return packages.some((package_) => callback(package_));
  }

  static comparator(package1: Package, package2: Package) {
    return package1.name.localeCompare(package2.name);
  }
}
