# check-dependency-version-consistency

[![npm version](https://badge.fury.io/js/check-dependency-version-consistency.svg)](https://badge.fury.io/js/check-dependency-version-consistency)
![CI](https://github.com/bmish/check-dependency-version-consistency/workflows/CI/badge.svg)

This plugin checks to ensure that dependencies are on consistent versions across a monorepo / yarn workspace. For example, every package in a workspace that has a dependency on `eslint` should specify the same version for it.

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
eslint has more than one version: ^7.0.0 (1 usage), ^7.1.0 (5 usages)
sinon has more than one version: ^1.17.7 (1 usage), ^9.0.3 (3 usages)
```

## Options

| Name | Description |
| --- | --- |
| `--ignore-dep` | Dependency to ignore mismatches for (option can be repeated). |
