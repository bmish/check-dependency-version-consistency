import { join } from 'node:path';
import { globbySync } from 'globby';
import { Package } from './package.js';

export function getPackages(
  root: string,
  ignorePackages: readonly string[],
  ignorePackagePatterns: readonly RegExp[],
  ignorePaths: readonly string[],
  ignorePathPatterns: readonly RegExp[],
): readonly Package[] {
  // Check for some error cases first.
  if (!Package.exists(root)) {
    throw new Error('No package.json found at provided path.');
  }
  const package_ = new Package(root, root);
  if (package_.workspacePatterns.length === 0) {
    throw new Error('Package at provided path has no workspaces specified.');
  }

  const packages = accumulatePackages(root, ['.']);

  // Ensure each ignore option matches at least one package, otherwise it's likely a mistake.
  assertEachMatches(
    packages,
    ignorePackages,
    (package_, name) => package_.name === name,
    (name) =>
      `Specified option '--ignore-package ${name}', but no such package detected in workspace.`,
  );
  assertEachMatches(
    packages,
    ignorePackagePatterns,
    (package_, pattern) => pattern.test(package_.name),
    (pattern) =>
      `Specified option '--ignore-package-pattern ${String(
        pattern,
      )}', but no matching packages detected in workspace.`,
  );
  assertEachMatches(
    packages,
    ignorePaths,
    (package_, path) => package_.pathRelative.includes(path),
    (path) =>
      `Specified option '--ignore-path ${path}', but no matching paths detected in workspace.`,
  );
  assertEachMatches(
    packages,
    ignorePathPatterns,
    (package_, pattern) => pattern.test(package_.pathRelative),
    (pattern) =>
      `Specified option '--ignore-path-pattern ${String(
        pattern,
      )}', but no matching paths detected in workspace.`,
  );

  if (
    ignorePackages.length === 0 &&
    ignorePackagePatterns.length === 0 &&
    ignorePaths.length === 0 &&
    ignorePathPatterns.length === 0
  ) {
    // Nothing to ignore. Return early to avoid touching `package_.name`, which throws for unnamed packages.
    return packages;
  }

  function isIgnored(package_: Package): boolean {
    return (
      ignorePackages.includes(package_.name) ||
      ignorePackagePatterns.some((pattern) => pattern.test(package_.name)) ||
      ignorePaths.some((path) => package_.pathRelative.includes(path)) ||
      ignorePathPatterns.some((pattern) => pattern.test(package_.pathRelative))
    );
  }

  return packages.filter((package_) => !isIgnored(package_));
}

/** Throws if any of the provided ignore entries matches no package in the workspace. */
function assertEachMatches<T>(
  packages: readonly Package[],
  entries: readonly T[],
  matches: (package_: Package, entry: T) => boolean,
  makeError: (entry: T) => string,
): void {
  for (const entry of entries) {
    if (!packages.some((package_) => matches(package_, entry))) {
      throw new Error(makeError(entry));
    }
  }
}

// Expand workspace globs into concrete paths.
function expandWorkspaces(
  root: string,
  workspacePatterns: readonly string[],
): readonly string[] {
  // Separate negation patterns (exclusions) from inclusion patterns
  const inclusionPatterns = workspacePatterns.filter((p) => !p.startsWith('!'));
  const exclusionPatterns = workspacePatterns
    .filter((p) => p.startsWith('!'))
    .map((p) => p.slice(1)); // Remove the leading '!'

  return inclusionPatterns.flatMap((workspace) => {
    if (!workspace.includes('*')) {
      return [workspace];
    }
    // Use cwd instead of passing join()'d paths to globby for Windows support: https://github.com/micromatch/micromatch/blob/34f44b4f57eacbdbcc74f64252e0845cf44bbdbd/README.md?plain=1#L822
    // Ignore any node_modules that may be present due to the use of nohoist.
    return globbySync(workspace, {
      onlyDirectories: true,
      cwd: root,
      ignore: ['**/node_modules', ...exclusionPatterns],
    });
  });
}

// Recursively collect packages from a workspace.
function accumulatePackages(
  root: string,
  paths: readonly string[],
): readonly Package[] {
  const results = [];
  for (const relativePath of paths) {
    const path = join(root, relativePath);
    if (Package.exists(path)) {
      const package_ = new Package(path, root);
      results.push(
        // Add the current package.
        package_,
        // Recursively add any nested workspace packages that might exist here.
        // This package is the new root.
        ...accumulatePackages(
          path,
          expandWorkspaces(path, package_.workspacePatterns),
        ),
      );
    }
  }
  return results;
}
