import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { getDirectoriesInPath } from './fs';
import { flatMap } from './js';

export function getPackageJsonPaths(root: string): string[] {
  return getPackages(root).map((pkg: string) =>
    join(root, pkg, 'package.json')
  );
}

function getPackages(root: string): string[] {
  return flatMap(getWorkspaces(root), (packageLocation: string) => {
    if (packageLocation.includes('*')) {
      const packageLocationWithoutStar = packageLocation.replace('*', '');
      return getDirectoriesInPath(
        join(root, packageLocationWithoutStar)
      ).map((pkg) => join(packageLocationWithoutStar, pkg));
    } else {
      return packageLocation;
    }
  });
}

export function getWorkspaces(root: string): string[] {
  const workspacePackageJsonPath = join(root, 'package.json');
  if (!existsSync(workspacePackageJsonPath)) {
    throw new Error('No package.json found at provided path.');
  }

  const workspacePackageJson = JSON.parse(
    readFileSync(join(root, 'package.json'), 'utf-8')
  );

  if (!workspacePackageJson.workspaces) {
    throw new Error(
      'package.json at provided path does not specify `workspaces`.'
    );
  }

  return workspacePackageJson.workspaces;
}
