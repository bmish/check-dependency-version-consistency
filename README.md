# check-dependency-version-consistency

[![npm version](https://badge.fury.io/js/check-dependency-version-consistency.svg)](https://badge.fury.io/js/check-dependency-version-consistency)
![CI](https://github.com/bmish/check-dependency-version-consistency/workflows/CI/badge.svg)

This plugin checks to ensure that dependencies are on consistent versions across a monorepo / yarn workspace.

## Usage

To run, pass the path to the workspace root:

```sh
yarn check-dependency-version-consistency .
```

This can be incorporated as one of your lint scripts like this:

```json
"lint": "npm-run-all --continue-on-error --aggregate-output --parallel lint:*",
"lint:dependency-versions": "check-dependency-version-consistency ."
"lint:js": "eslint . --cache",
```

Example output:

```pt
eslint has more than one version: ^7.0.0, ^7.1.0
sinon has more than one version: ^1.17.7, ^9.0.3
```

## Options

| Name | Description |
| --- | --- |
| `--ignore-dep` | Dependency to ignore mismatches for (option can be repeated). |
