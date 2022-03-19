import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import type { PackageJson } from 'type-fest';
import { globbySync } from 'globby';
import { Package } from './package.js';

export function getPackages(
  root: string,
  ignorePackages: string[],
  ignorePackagePatterns: RegExp[],
  ignorePaths: string[],
  ignorePathPatterns: RegExp[]
): Package[] {
  const packages = accumulatePackages(root, ['.']);

  for (const ignoredPackage of ignorePackages) {
    if (
      !Package.some(packages, (package_) => package_.name === ignoredPackage) // eslint-disable-line unicorn/no-array-method-this-argument,unicorn/no-array-callback-reference -- false positive
    ) {
      throw new Error(
        `Specified option '--ignore-package ${ignoredPackage}', but no such package detected in workspace.`
      );
    }
  }

  for (const ignoredPackagePattern of ignorePackagePatterns) {
    if (
      // eslint-disable-next-line unicorn/no-array-method-this-argument,unicorn/no-array-callback-reference -- false positive
      !Package.some(packages, (package_) =>
        ignoredPackagePattern.test(package_.name)
      )
    ) {
      throw new Error(
        `Specified option '--ignore-package-pattern ${ignoredPackagePattern}', but no matching packages detected in workspace.`
      );
    }
  }

  for (const ignoredPath of ignorePaths) {
    if (
      // eslint-disable-next-line unicorn/no-array-method-this-argument,unicorn/no-array-callback-reference -- false positive
      !Package.some(packages, (package_) =>
        package_.pathRelative.includes(ignoredPath)
      )
    ) {
      throw new Error(
        `Specified option '--ignore-path ${ignoredPath}', but no matching paths detected in workspace.`
      );
    }
  }

  for (const ignoredPathPattern of ignorePathPatterns) {
    if (
      // eslint-disable-next-line unicorn/no-array-method-this-argument,unicorn/no-array-callback-reference -- false positive
      !Package.some(packages, (package_) =>
        ignoredPathPattern.test(package_.pathRelative)
      )
    ) {
      throw new Error(
        `Specified option '--ignore-path-pattern ${ignoredPathPattern}', but no matching paths detected in workspace.`
      );
    }
  }

  if (
    ignorePackages.length > 0 ||
    ignorePackagePatterns.length > 0 ||
    ignorePaths.length > 0 ||
    ignorePathPatterns.length > 0
  ) {
    return packages.filter(
      (package_) =>
        !ignorePackages.includes(package_.name) &&
        !ignorePackagePatterns.some((ignorePackagePattern) =>
          package_.name.match(ignorePackagePattern)
        ) &&
        !ignorePaths.some((ignorePath) =>
          package_.pathRelative.includes(ignorePath)
        ) &&
        !ignorePathPatterns.some((ignorePathPattern) =>
          package_.pathRelative.match(ignorePathPattern)
        )
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
    readFileSync(join(root, 'package.json'), 'utf8')
  );

  if (!workspacePackageJson.workspaces) {
    throw new Error(
      'package.json at provided path does not specify `workspaces`.'
    );
  }

  if (!Array.isArray(workspacePackageJson.workspaces)) {
    if (workspacePackageJson.workspaces.packages) {
      if (Array.isArray(workspacePackageJson.workspaces.packages)) {
        return workspacePackageJson.workspaces.packages;
      } else {
        throw new TypeError(
          'package.json `workspaces.packages` is not a string array.'
        );
      }
    }
    throw new TypeError('package.json `workspaces` is not a string array.');
  }

  return workspacePackageJson.workspaces;
}

// Expand workspace globs into concrete existing pathnames.
function expandWorkspaces(root: string, workspacePatterns: string[]) {
  return workspacePatterns.flatMap((workspace) => {
    if (!workspace.includes('*')) {
      return [workspace];
    }
    // Use cwd instead of passing join()'d paths to globby for Windows support: https://github.com/micromatch/micromatch/blob/34f44b4f57eacbdbcc74f64252e0845cf44bbdbd/README.md?plain=1#L822
    return globbySync(workspace, { onlyDirectories: true, cwd: root });
  });
}

// Add packages found at the given paths to the packages array, if there's a package there,
// and also any workspaces listed by those packages.
function accumulatePackages(root: string, paths: string[]): Package[] {
  const results = [];
  for (const relativePath of paths) {
    const path = join(root, relativePath);
    if (Package.exists(path)) {
      const package_ = new Package(path, root);
      results.push(package_);
      const workspacePatterns = package_.workspacePatterns.map(
        (workspacePath) => join(relativePath, workspacePath)
      );
      results.push(
        ...accumulatePackages(root, expandWorkspaces(root, workspacePatterns))
      );
    }
  }
  return results;
}
