#!/usr/bin/env node
/* eslint node/shebang:"off" -- shebang needed so compiled code gets interpreted as JS */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import {
  calculateVersionsForEachDependency,
  calculateMismatchingVersions,
} from '../lib/dependency-versions';
import { mismatchingVersionsToOutputLines } from '../lib/output';
import { join } from 'path';

function getCurrentPackageVersion(): string {
  return JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8') // Relative to compiled version of this file in dist/bin
  ).version;
}

// Used for collecting repeated CLI options into an array.
function collect(value: string, previous: string[]) {
  return previous.concat([value]);
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
  .action(function (path) {
    // Calculate.
    const dependencyVersions = calculateVersionsForEachDependency(path);
    const mismatchingVersions = calculateMismatchingVersions(
      dependencyVersions,
      program.ignoreDep
    );

    // Show output.
    if (mismatchingVersions.length > 0) {
      const outputLines = mismatchingVersionsToOutputLines(mismatchingVersions);
      outputLines.forEach((line) => console.log(line));
      process.exitCode = 1;
    }
  })
  .parse(process.argv);
