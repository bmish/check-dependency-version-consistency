import type { MismatchingDependencyVersions } from './dependency-versions';

export function mismatchingVersionsToOutputLines(
  mismatchingDependencyVersions: MismatchingDependencyVersions
): string[] {
  return mismatchingDependencyVersions.map(
    (obj) =>
      `${obj.dependency} has more than one version: ${obj.versions.join(', ')}`
  );
}
