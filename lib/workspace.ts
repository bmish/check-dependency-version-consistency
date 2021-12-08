import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import type { PackageJson } from 'type-fest';
import { globbySync } from 'globby';

export function getPackageJsonPaths(root: string): string[] {
  return getPackages(root)
    .map((pkg: string) => join(pkg, 'package.json'))
    .filter((packageJsonPath) => existsSync(packageJsonPath));
}

function getPackages(root: string): string[] {
  const workspacePackages = getWorkspaces(root).flatMap((workspace) => {
    if (!workspace.includes('*')) {
      return workspace;
    }

    // Use cwd instead of passing join()'d paths to globby for Windows support: https://github.com/micromatch/micromatch/blob/34f44b4f57eacbdbcc74f64252e0845cf44bbdbd/README.md?plain=1#L822
    return globbySync(workspace, { onlyDirectories: true, cwd: root });
  });

  return ['.', ...workspacePackages].map((path) => join(root, path)); // Include workspace root.
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
