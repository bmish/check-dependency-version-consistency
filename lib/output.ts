import type { MismatchingDependencyVersions } from './dependency-versions.js';
import { compareRanges } from './dependency-versions.js';

export function mismatchingVersionsToOutputLines(
  mismatchingDependencyVersions: MismatchingDependencyVersions
): string[] {
  return mismatchingDependencyVersions.map(
    (obj) =>
      `${obj.dependency} has more than one version: ${obj.versions
        .sort((a, b) => compareRanges(a.version, b.version))
        .map(
          (versionObj) =>
            `${versionObj.version} (${versionObj.count} ${pluralizeUsage(
              versionObj.count
            )})`
        )
        .join(', ')}`
  );
}

function pluralizeUsage(count: number) {
  return count === 1 ? 'usage' : 'usages';
}
