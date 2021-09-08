import chalk from 'chalk';
import type { MismatchingDependencyVersions } from './dependency-versions.js';
import { compareRanges } from './dependency-versions.js';
import { table } from 'table';

export function mismatchingVersionsToOutput(
  mismatchingDependencyVersions: MismatchingDependencyVersions
): string {
  if (mismatchingDependencyVersions.length === 0) {
    throw new Error('No mismatching versions to output.');
  }

  const tables = mismatchingDependencyVersions
    .map((obj) => {
      const headers = [chalk.bold(obj.dependency), 'Usages'];
      const rows = obj.versions
        .sort((a, b) => compareRanges(a.version, b.version))
        .map((versionObj) => [
          chalk.redBright(versionObj.version),
          versionObj.count,
        ]);
      return table([headers, ...rows]);
    })
    .join('');

  return [
    `Found ${mismatchingDependencyVersions.length} ${
      mismatchingDependencyVersions.length === 1 ? 'dependency' : 'dependencies'
    } with mismatching versions across the workspace.`,
    tables,
  ].join('\n');
}
