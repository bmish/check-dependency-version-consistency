#!/usr/bin/env node
/* eslint node/shebang:"off" -- shebang needed so compiled code gets interpreted as JS */

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import {
  calculateVersionsForEachDependency,
  calculateMismatchingVersions,
  filterOutIgnoredDependencies,
  fixMismatchingVersions,
} from '../lib/dependency-versions.js';
import { mismatchingVersionsToOutputLines } from '../lib/output.js';
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
    .argument('<path>', 'path to workspace root')
    .option(
      '--fix',
      'Whether to autofix inconsistencies (using highest version present)',
      false
    )
    .option(
      '--ignore-dep <dependency>',
      'Dependency to ignore (option can be repeated)',
      collect,
      []
    )
    .action(function (path, options: { ignoreDep: string[]; fix: boolean }) {
      // Calculate.
      const dependencyVersions = calculateVersionsForEachDependency(path);
      let mismatchingVersions = filterOutIgnoredDependencies(
        calculateMismatchingVersions(dependencyVersions),
        options.ignoreDep
      );

      if (options.fix) {
        mismatchingVersions = fixMismatchingVersions(path, mismatchingVersions);
      }

      // Show output.
      if (mismatchingVersions.length > 0) {
        const outputLines =
          mismatchingVersionsToOutputLines(mismatchingVersions);
        outputLines.forEach((line) => console.log(line));
        process.exitCode = 1;
      }
    })
    .parse(process.argv);
}

try {
  run();
} catch (e) {
  if (e instanceof Error) {
    console.error(e.message);
  }
  process.exitCode = 1;
}
