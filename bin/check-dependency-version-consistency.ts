#!/usr/bin/env node
/* eslint node/shebang:"off" -- shebang needed so compiled code gets interpreted as JS */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import {
  calculateVersionsForEachDependency,
  calculateMismatchingVersions,
  filterOutIgnoredDependencies,
} from '../lib/dependency-versions';
import { mismatchingVersionsToOutputLines } from '../lib/output';
import { join } from 'path';
import type { PackageJson } from 'type-fest';

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
const program = new Command();
program
  .version(getCurrentPackageVersion())
  .arguments('<path>')
  .option(
    '--ignore-dep <dependency>',
    'Dependency to ignore (option can be repeated)',
    collect,
    []
  )
  .action(function (path, options: { ignoreDep: string[] }) {
    // Calculate.
    const dependencyVersions = calculateVersionsForEachDependency(path);
    const mismatchingVersions = filterOutIgnoredDependencies(
      calculateMismatchingVersions(dependencyVersions),
      options.ignoreDep
    );

    // Show output.
    if (mismatchingVersions.length > 0) {
      const outputLines = mismatchingVersionsToOutputLines(mismatchingVersions);
      outputLines.forEach((line) => console.log(line));
      process.exitCode = 1;
    }
  })
  .parse(process.argv);
