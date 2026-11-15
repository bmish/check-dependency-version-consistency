import semver from 'semver';

// This version doesn't throw for when we want to ignore invalid versions that might be present.
export function compareVersionRangesSafe(a: string, b: string): 0 | -1 | 1 {
  try {
    return compareVersionRanges(a, b);
  } catch {
    return 0;
  }
}

// Coerce to normalized version without any range prefix, keeping any prerelease tag.
// Specifiers like `npm:foo@^1.0.0`, git URLs, and file paths contain a version-like substring but aren't semver ranges.
function coerceVersionRange(versionRange: string) {
  if (!semver.validRange(versionRange)) {
    return undefined;
  }
  return semver.coerce(versionRange, { includePrerelease: true }) ?? undefined;
}

// Compare semver version ranges like ^1.0.0, ~2.5.0, 3.0.0, etc.
export function compareVersionRanges(a: string, b: string): 0 | -1 | 1 {
  const aVersion = coerceVersionRange(a);
  const bVersion = coerceVersionRange(b);
  if (!aVersion) {
    throw new Error(`Invalid Version: ${a}`);
  }
  if (!bVersion) {
    throw new Error(`Invalid Version: ${b}`);
  }

  if (semver.eq(aVersion, bVersion)) {
    // Same version, so decide which range is considered higher.
    const aRange = versionRangeToRange(a);
    const bRange = versionRangeToRange(b);
    return compareRanges(aRange, bRange);
  }

  // Greater version considered higher.
  return semver.gt(aVersion, bVersion) ? 1 : -1;
}

const RANGE_PRECEDENCE = ['~', '^']; // Lowest to highest.

// Compare semver ranges like ^, ~, etc.
export function compareRanges(aRange: string, bRange: string): 0 | -1 | 1 {
  const aRangePrecedence = RANGE_PRECEDENCE.indexOf(aRange);
  const bRangePrecedence = RANGE_PRECEDENCE.indexOf(bRange);
  if (aRangePrecedence > bRangePrecedence) {
    return 1;
  } else if (aRangePrecedence < bRangePrecedence) {
    return -1;
  }
  return 0;
}

// Example input: ^1.0.0, output: ^
export function versionRangeToRange(versionRange: string): string {
  const match = versionRange.match(/^\D+/);
  return match ? match[0] : '';
}

export function getLatestVersion(versions: readonly string[]): string {
  const sortedVersions = [...versions].toSorted(compareVersionRanges);
  if (sortedVersions.length === 0) {
    throw new Error('No versions provided.');
  }
  return sortedVersions.at(-1) as string; // Latest version will be sorted to end of list.
}

// Example input: ['~', '^'], output: '^'
export function getHighestRangeType(ranges: readonly string[]): string {
  const sorted = [...ranges].toSorted(compareRanges);
  if (sorted.length === 0) {
    throw new Error('No ranges provided.');
  }
  return sorted.at(-1) as string; // Range with highest precedence will be sorted to end of list.
}

// Example input: ['1.5.0', '^1.0.0'], output: '^1.5.0'
export function getIncreasedLatestVersion(versions: readonly string[]): string {
  const latestVersion = getLatestVersion(versions);
  const latestVersionBare = coerceVersionRange(latestVersion);

  let result = latestVersion;
  let resultBare = latestVersionBare;
  for (const version of versions) {
    if (version === latestVersion) {
      continue;
    }

    const versionBare = coerceVersionRange(version);

    if (
      latestVersionBare &&
      semver.satisfies(latestVersionBare, version) &&
      versionBare &&
      semver.gt(latestVersionBare, versionBare) &&
      resultBare
    ) {
      // Partial versions like `^1.2` don't contain their coerced `1.2.0`, so the replacement can be a no-op that would lower the result.
      const candidate = version.replace(
        String(versionBare),
        String(resultBare),
      );
      if (compareVersionRanges(candidate, result) >= 0) {
        result = candidate;
        resultBare = coerceVersionRange(result);
      }
    }
  }

  return result;
}
