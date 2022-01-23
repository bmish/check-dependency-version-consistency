#!/usr/bin/env node
/* eslint node/shebang:"off" -- shebang needed so compiled code gets interpreted as JS */

import { Command, Argument } from 'commander';
import { readFileSync } from 'node:fs';
import {
  calculateVersionsForEachDependency,
  calculateMismatchingVersions,
  filterOutIgnoredDependencies,
  fixMismatchingVersions,
  MismatchingDependencyVersions,
} from '../lib/dependency-versions.js';
import { getPackages } from '../lib/workspace.js';
import {
  mismatchingVersionsToOutput,
  mismatchingVersionsFixedToOutput,
} from '../lib/output.js';
import { join, dirname } from 'node:path';
import type { PackageJson } from 'type-fest';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getCurrentPackageVersion(): string {
  const packageJson: PackageJson = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8') // Relative to compiled version of this file in dist/bin
  );
  if (!packageJson.version) {
    throw new Error('Could not find package.json `version`');
  }
  return packageJson.version;
}

// Used for collecting repeated CLI options into an array.
function collect(value: string, previous: string[]) {
  return [...previous, value];
}

// Setup CLI.
function run() {
  const program = new Command();

  program
    .version(getCurrentPackageVersion())
    .addArgument(new Argument('[path]', 'path to workspace root').default('.'))
    .option(
      '--fix',
      'Whether to autofix inconsistencies (using latest version present)',
      false
    )
    .option(
      '--ignore-dep <dependency-name>',
      'Dependency to ignore (option can be repeated)',
      collect,
      []
    )
    .option(
      '--ignore-dep-pattern <dependency-name-pattern>',
      'RegExp of dependency names to ignore (option can be repeated)',
      collect,
      []
    )
    .option(
      '--ignore-package <package-name>',
      'Workspace package to ignore (option can be repeated)',
      collect,
      []
    )
    .option(
      '--ignore-package-pattern <package-name-pattern>',
      'RegExp of package names to ignore (option can be repeated)',
      collect,
      []
    )
    .option(
      '--ignore-path <path>',
      'Workspace-relative path of packages to ignore (option can be repeated)',
      collect,
      []
    )
    .option(
      '--ignore-path-pattern <path-pattern>',
      'RegExp of workspace-relative path of packages to ignore (option can be repeated)',
      collect,
      []
    )
    .action(function (
      path,
      options: {
        ignoreDep: string[];
        ignoreDepPattern: string[];
        ignorePackage: string[];
        ignorePackagePattern: string[];
        ignorePath: string[];
        ignorePathPattern: string[];
        fix: boolean;
      }
    ) {
      // Calculate.
      const packages = getPackages(
        path,
        options.ignorePackage,
        options.ignorePackagePattern.map((s) => new RegExp(s)),
        options.ignorePath,
        options.ignorePathPattern.map((s) => new RegExp(s))
      );

      const dependencyVersions = calculateVersionsForEachDependency(packages);

      let mismatchingVersions = filterOutIgnoredDependencies(
        calculateMismatchingVersions(dependencyVersions),
        options.ignoreDep,
        options.ignoreDepPattern.map((s) => new RegExp(s))
      );
      let mismatchingVersionsFixed: MismatchingDependencyVersions = [];

      if (options.fix) {
        const resultsAfterFix = fixMismatchingVersions(
          packages,
          mismatchingVersions
        );
        mismatchingVersions = resultsAfterFix.notFixed;
        mismatchingVersionsFixed = resultsAfterFix.fixed;
      }

      // Show output for dependencies we fixed.
      if (mismatchingVersionsFixed.length > 0) {
        console.log(mismatchingVersionsFixedToOutput(mismatchingVersionsFixed));
      }

      // Show output for dependencies that still have mismatches.
      if (mismatchingVersions.length > 0) {
        console.log(mismatchingVersionsToOutput(mismatchingVersions));
        process.exitCode = 1;
      }
    })
    .parse(process.argv);
}

try {
  run();
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
  process.exitCode = 1;
}
