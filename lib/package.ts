import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PackageJson } from 'type-fest';

// Class to represent all of the information we need to know about a package in a workspace.
export class Package {
  path: string;
  packageJson: PackageJson;
  packageJsonPath: string;
  packageJsonEndsInNewline: boolean;

  constructor(path: string) {
    this.path = path;
    this.packageJsonPath = join(path, 'package.json');
    const packageJsonContents = readFileSync(this.packageJsonPath, 'utf-8');
    this.packageJsonEndsInNewline = packageJsonContents.endsWith('\n');
    this.packageJson = JSON.parse(packageJsonContents);
  }

  get name() {
    if (this.packageJson.workspaces && !this.packageJson.name) {
      return '(Root)';
    }
    if (!this.packageJson.name) {
      throw new Error(`${this.packageJsonPath} missing \`name\``);
    }
    return this.packageJson.name;
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
