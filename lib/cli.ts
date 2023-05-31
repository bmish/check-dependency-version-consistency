import { Command, Argument } from 'commander';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { PackageJson } from 'type-fest';
import { fileURLToPath } from 'node:url';
import { CDVC } from './cdvc.js';
import { DEPENDENCY_TYPE, Options } from './types.js';
import { DEFAULT_DEP_TYPES } from './defaults.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function getCurrentPackageVersion(): string {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8') // Relative to compiled version of this file in the dist folder.
  ) as PackageJson;
  if (!packageJson.version) {
    throw new Error('Could not find package.json `version`');
  }
  return packageJson.version;
}

// Used for collecting repeated CLI options into an array.
function collect(value: string, previous: readonly string[]) {
  return [...previous, value];
}

// Setup CLI.
export function run() {
  const program = new Command();

  program
    .description(
      'CLI tool which checks that dependencies are on consistent versions across a monorepo / npm/pnpm/Yarn workspace.'
    )
    .version(getCurrentPackageVersion())
    .addArgument(new Argument('[path]', 'path to workspace root').default('.'))
    .option(
      '--dep-type <dependency-type>',
      `Type of dependency to check (choices: ${Object.keys(
        DEPENDENCY_TYPE
      ).join(', ')}) (default: ${DEFAULT_DEP_TYPES.join(
        ', '
      )}) (option can be repeated)`,
      collect,
      []
    )
    .option(
      '--fix',
      'Whether to autofix inconsistencies (using highest version present)',
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
    .action((path: string, options: Options) => {
      const cdvc = new CDVC(path, options);

      if (options.fix) {
        // Show output for dependencies we fixed.
        if (cdvc.hasMismatchingDependenciesFixable) {
          console.log(cdvc.toFixedSummary());
        }

        // Show output for dependencies that still have mismatches.
        if (cdvc.hasMismatchingDependenciesNotFixable) {
          console.log(cdvc.toMismatchSummary());
          process.exitCode = 1;
        }
      } else if (cdvc.hasMismatchingDependencies) {
        // Show output for dependencies that have mismatches.
        console.log(cdvc.toMismatchSummary());
        process.exitCode = 1;
      }
    })
    .parse(process.argv);

  return program;
}
