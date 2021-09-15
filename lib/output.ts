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
      const headers = [chalk.bold(obj.dependency), 'Usages', 'Packages'];
      const rows = obj.versions
        .sort((a, b) => compareRanges(b.version, a.version))
        .map((versionObj) => {
          const packages =
            versionObj.packages.length > 3
              ? `${versionObj.packages.slice(0, 3).join(', ')}, and ${
                  versionObj.packages.length - 3
                } other${versionObj.packages.length - 3 === 1 ? '' : 's'}`
              : versionObj.packages.join(', ');
          return [
            chalk.redBright(versionObj.version),
            versionObj.packages.length,
            packages,
          ];
        });
      return table([headers, ...rows]);
    })
    .join('');

  return [
    `Found ${mismatchingDependencyVersions.length} ${
      mismatchingDependencyVersions.length === 1 ? 'dependency' : 'dependencies'
    } with mismatching versions across the workspace. Fix with \`--fix\`.`,
    tables,
  ].join('\n');
}
