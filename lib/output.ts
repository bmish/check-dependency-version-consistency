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
    .map((object) => {
      const headers = [chalk.bold(object.dependency), 'Usages', 'Packages'];

      const usageCounts = object.versions.map(
        (versionObject) => versionObject.packages.length
      );
      const highestUsageCount = Math.max(...usageCounts);
      const hasMultipleUsageCounts = !usageCounts.every(
        (count) => count === highestUsageCount
      );

      const rows = object.versions
        .sort((a, b) => {
          try {
            return compareRanges(b.version, a.version);
          } catch {
            return 0;
          }
        })
        .map((versionObject) => {
          const usageCount = versionObject.packages.length;
          const packageNames = versionObject.packages.map((package_) =>
            package_ === '.' ? '(Root)' : package_
          );
          const packageListSentence =
            usageCount > 3
              ? `${packageNames.slice(0, 3).join(', ')}, and ${
                  usageCount - 3
                } other${usageCount - 3 === 1 ? '' : 's'}`
              : packageNames.join(', ');
          return [
            chalk.redBright(versionObject.version),
            // Bold the usage count if it's the highest, as long as it's not the only usage count present.
            usageCount === highestUsageCount && hasMultipleUsageCounts
              ? chalk.bold(usageCount)
              : usageCount,
            packageListSentence,
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
