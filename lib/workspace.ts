import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import type { PackageJson } from 'type-fest';
import { globbySync } from 'globby';
import { Package } from './package.js';

export function getPackages(root: string, ignorePackages: string[]): Package[] {
  const workspacePackages = getWorkspaces(root).flatMap((workspace) => {
    if (!workspace.includes('*')) {
      return workspace;
    }

    // Use cwd instead of passing join()'d paths to globby for Windows support: https://github.com/micromatch/micromatch/blob/34f44b4f57eacbdbcc74f64252e0845cf44bbdbd/README.md?plain=1#L822
    return globbySync(workspace, { onlyDirectories: true, cwd: root });
  });

  const paths = [
    '.', // Include workspace root.
    ...workspacePackages,
  ].map((path) => join(root, path));

  const packages = paths
    .filter((path) => Package.exists(path))
    .map((path) => new Package(path));

  for (const ignoredPackage of ignorePackages) {
    if (
      !Package.some(packages, (package_) => package_.name === ignoredPackage) // eslint-disable-line unicorn/no-array-method-this-argument,unicorn/no-array-callback-reference -- false positive
    ) {
      throw new Error(
        `Specified option '--ignore-package ${ignoredPackage}', but no such package detected in workspace.`
      );
    }
  }

  if (ignorePackages.length > 0) {
    return packages.filter(
      (package_) => !ignorePackages.includes(package_.name)
    );
  }

  return packages;
}

export function getWorkspaces(root: string): string[] {
  const workspacePackageJsonPath = join(root, 'package.json');
  if (!existsSync(workspacePackageJsonPath)) {
    throw new Error('No package.json found at provided path.');
  }

  const workspacePackageJson: PackageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf-8')
  );

  if (!workspacePackageJson.workspaces) {
    throw new Error(
      'package.json at provided path does not specify `workspaces`.'
    );
  }

  if (!Array.isArray(workspacePackageJson.workspaces)) {
    throw new TypeError('package.json `workspaces` is not a string array.');
  }

  return workspacePackageJson.workspaces;
}
