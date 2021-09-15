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

      const usageCounts = obj.versions.map(
        (versionObj) => versionObj.packages.length
      );
      const highestUsageCount = Math.max(...usageCounts);
      const hasMultipleUsageCounts = !usageCounts.every(
        (count) => count === highestUsageCount
      );

      const rows = obj.versions
        .sort((a, b) => compareRanges(b.version, a.version))
        .map((versionObj) => {
          const usageCount = versionObj.packages.length;
          const packages =
            usageCount > 3
              ? `${versionObj.packages.slice(0, 3).join(', ')}, and ${
                  usageCount - 3
                } other${usageCount - 3 === 1 ? '' : 's'}`
              : versionObj.packages.join(', ');
          return [
            chalk.redBright(versionObj.version),
            // Bold the usage count if it's the highest, as long as it's not the only usage count present.
            usageCount === highestUsageCount && hasMultipleUsageCounts
              ? chalk.bold(usageCount)
              : usageCount,
            packages,
          ];
        });
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
