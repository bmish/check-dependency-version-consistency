# check-dependency-version-consistency

[![npm version](https://badge.fury.io/js/check-dependency-version-consistency.svg)](https://badge.fury.io/js/check-dependency-version-consistency)
![CI](https://github.com/bmish/check-dependency-version-consistency/workflows/CI/badge.svg)

This plugin checks to ensure that dependencies are on consistent versions across a monorepo / yarn workspace. For example, every package in a workspace that has a dependency on `eslint` should specify the same version for it.

## Motivation

* **Supports a uniform developer experience.** Like shared code formatting standards, consistent dependency versions reduce friction and make it easier for developers to jump around and work across packages in a monorepo.
* **Discourages piecemeal upgrades.** When possible, a dependency should be upgraded everywhere it exists in a monorepo at the same time. Upgrades are also simpler and easier to perform when fewer versions are present.
* **Reduces unexpected behavior.** Having old versions present can lead to confusion, e.g., a bug present in some parts of a monorepo but not others, or uncertainty about which version wins out when served to the browser.
* **Cuts down on bundle size.** Avoid serving excess dependency code to the browser.
* **Saves disk space and installation time.** Faster local development and CI.

## Usage

To install:

```sh
yarn add --dev check-dependency-version-consistency
```

To run, pass the path to the workspace root:

```sh
yarn check-dependency-version-consistency .
```

This can be incorporated as one of your package.json lint scripts like this:

```json
"lint": "npm-run-all --continue-on-error --aggregate-output --parallel lint:*",
"lint:dependency-versions": "check-dependency-version-consistency ."
"lint:js": "eslint . --cache",
```

If there are no dependency mismatches, the program will exit with success.

If there are any dependency mismatches, the program will exit with failure and output the mismatching versions:

```pt
eslint has more than one version:
    ^7.8.9 (1 usage)
    ^8.0.0 (1 usage)
sinon has more than one version:
    1.2.0 (2 usages)
    1.3.0 (1 usage)
```

## Options

| Name | Description |
| --- | --- |
| `--fix` | Whether to autofix inconsistencies (using highest version present). |
| `--ignore-dep` | Dependency to ignore mismatches for (option can be repeated). |

## Related

* [npm-package-json-lint](https://github.com/tclindner/npm-package-json-lint) — use this complimentary tool to enforce that your dependency versions use consistent range types (i.e. [prefer-caret-version-ranges](https://npmpackagejsonlint.org/docs/en/rules/dependencies/prefer-caret-version-dependencies), [prefer-caret-version-devDependencies](https://npmpackagejsonlint.org/docs/en/rules/dependencies/prefer-caret-version-devdependencies))
