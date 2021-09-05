import chalk from 'chalk';

import type { MismatchingDependencyVersions } from './dependency-versions.js';
import { compareRanges } from './dependency-versions.js';

export function mismatchingVersionsToOutputLines(
  mismatchingDependencyVersions: MismatchingDependencyVersions
): string[] {
  return mismatchingDependencyVersions.map(
    (obj) =>
      `${chalk.bold(
        obj.dependency
      )} has more than one version:\n  ${obj.versions
        .sort((a, b) => compareRanges(a.version, b.version))
        .map(
          (versionObj) =>
            `${versionObj.version} (${versionObj.count} ${pluralizeUsage(
              versionObj.count
            )})`
        )
        .join('\n  ')}`
  );
}

function pluralizeUsage(count: number) {
  return count === 1 ? 'usage' : 'usages';
}
