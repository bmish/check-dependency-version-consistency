# check-dependency-version-consistency

[![npm version][npm-image]][npm-url]
[![CI][ci-image]][ci-url]

This CLI tool enforces the following aspects of consistency across a monorepo / yarn workspace:

1. Dependencies are on consistent versions. For example, every package in a workspace that has a dependency on `eslint` should specify the same version for it.
2. Dependencies on local packages use the local packages directly instead of older versions of them. For example, if one package `package1` in a workspace depends on another package `package2` in the workspace, `package1` should request the current version of `package2`.

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

To run, use this command and optionally pass the path to the workspace root (where the `package.json` file containing `workspaces` is located):

```sh
yarn check-dependency-version-consistency .
```

If there are no inconsistencies, the program will exit with success.

If there are any inconsistencies, the program will exit with failure and output the mismatching versions.

## Example

`package.json` (workspace root):

```json
{
  "workspaces": ["*"],
  "scripts": {
    "lint": "npm-run-all --continue-on-error --aggregate-output --parallel \"lint:*\"",
    "lint:dependency-versions": "check-dependency-version-consistency .",
    "lint:dependency-versions:fix": "npm-run-all \"lint:dependency-versions --fix\""
  },
  "devDependencies": {
    "check-dependency-version-consistency": "*",
    "npm-run-all": "*"
  }
}
```

`package1/package.json`:

```json
{
  "name": "package1",
  "devDependencies": {
    "eslint": "^8.0.0"
  },
  "dependencies": {
    "package2": "^0.0.0"
  }
}
```

`package2/package.json`:

```json
{
  "name": "package2",
  "version": "1.0.0",
  "devDependencies": {
    "eslint": "^7.0.0"
  }
}
```

`package3/package.json`:

```json
{
  "name": "package3",
  "devDependencies": {
    "eslint": "^7.0.0"
  }
}
```

Output:

```pt
Found 2 dependencies with mismatching versions across the workspace. Fix with `--fix`.
╔════════╤════════╤════════════════════╗
║ eslint │ Usages │ Packages           ║
╟────────┼────────┼────────────────────╢
║ ^8.0.0 │ 1      │ package1           ║
╟────────┼────────┼────────────────────╢
║ ^7.0.0 │ 2      │ package2, package3 ║
╚════════╧════════╧════════════════════╝
╔══════════╤════════╤══════════╗
║ package2 │ Usages │ Packages ║
╟──────────┼────────┼──────────╢
║ 1.0.0    │ 1      │ package2 ║
╟──────────┼────────┼──────────╢
║ ^0.0.0   │ 1      │ package1 ║
╚══════════╧════════╧══════════╝
```

## Options

| Name | Description |
| --- | --- |
| `--fix` | Whether to autofix inconsistencies (using latest version present). |
| `--ignore-dep` | Dependency to ignore mismatches for (option can be repeated). |
| `--ignore-dep-pattern` | RegExp of dependency names to ignore mismatches for (option can be repeated). |
| `--ignore-package` | Workspace package to ignore mismatches for (option can be repeated). |
| `--ignore-package-pattern` | RegExp of package names to ignore mismatches for (option can be repeated). |
| `--ignore-path` | Workspace-relative path of packages to ignore mismatches for (option can be repeated). |
| `--ignore-path-pattern` | RegExp of workspace-relative path of packages to ignore mismatches for (option can be repeated). |

## Related

* [npm-package-json-lint](https://github.com/tclindner/npm-package-json-lint) — use this complementary tool to enforce that your dependency versions use consistent range types (i.e. [prefer-caret-version-dependencies](https://npmpackagejsonlint.org/docs/rules/dependencies/prefer-caret-version-dependencies), [prefer-caret-version-devDependencies](https://npmpackagejsonlint.org/docs/rules/dependencies/prefer-caret-version-devDependencies))

## References

* [Yarn Workspaces](https://classic.yarnpkg.com/lang/en/docs/workspaces/)

[npm-image]: https://badge.fury.io/js/check-dependency-version-consistency.svg
[npm-url]: https://www.npmjs.com/package/check-dependency-version-consistency
[ci-image]: https://github.com/bmish/check-dependency-version-consistency/workflows/CI/badge.svg
[ci-url]: https://github.com/bmish/check-dependency-version-consistency/actions/workflows/ci.yml
