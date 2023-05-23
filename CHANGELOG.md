# check-dependency-version-consistency
























## v3.3.0 (2023-05-23)

#### :rocket: Enhancement
* [#605](https://github.com/bmish/check-dependency-version-consistency/pull/605) Add new option `--dep-type` ([@bmish](https://github.com/bmish))
* [#606](https://github.com/bmish/check-dependency-version-consistency/pull/606) Add `optionalDependencies` option to `--dep-type` ([@bmish](https://github.com/bmish))
* [#601](https://github.com/bmish/check-dependency-version-consistency/pull/601) Add `peerDependencies` option to `--dep-type` ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v3.2.1 (2023-05-20)

#### :bug: Bug Fix
* [#597](https://github.com/bmish/check-dependency-version-consistency/pull/597) Fix publishing issue from v3.2.0 ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v3.2.0 (2023-05-20)

#### :rocket: Enhancement
* [#591](https://github.com/bmish/check-dependency-version-consistency/pull/591) Add Node API ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#596](https://github.com/bmish/check-dependency-version-consistency/pull/596) Add some additional npm info to package.json ([@bmish](https://github.com/bmish))
* [#594](https://github.com/bmish/check-dependency-version-consistency/pull/594) Harden CI ([@bmish](https://github.com/bmish))
* [#595](https://github.com/bmish/check-dependency-version-consistency/pull/595) Test on Node 20 ([@bmish](https://github.com/bmish))
* [#593](https://github.com/bmish/check-dependency-version-consistency/pull/593) Enable better TypeScript linting ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v3.1.1 (2023-05-11)

#### :bug: Bug Fix
* [#590](https://github.com/bmish/check-dependency-version-consistency/pull/590) pnpm workspace root package should not require `name` ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v3.1.0 (2023-05-11)

#### :rocket: Enhancement
* [#574](https://github.com/bmish/check-dependency-version-consistency/pull/574) Support pnpm workspaces ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#586](https://github.com/bmish/check-dependency-version-consistency/pull/586) Add back error messages when unable to detect workspaces ([@bmish](https://github.com/bmish))

#### :memo: Documentation
* [#543](https://github.com/bmish/check-dependency-version-consistency/pull/543) Mention competing offering Yarn Constraints in readme ([@bmish](https://github.com/bmish))
* [#544](https://github.com/bmish/check-dependency-version-consistency/pull/544) Mention npm workspaces in readme ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#561](https://github.com/bmish/check-dependency-version-consistency/pull/561) Add Node v19 to CI ([@ddzz](https://github.com/ddzz))
* [#548](https://github.com/bmish/check-dependency-version-consistency/pull/548) Add CodeQL ([@bmish](https://github.com/bmish))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius Dzien ([@ddzz](https://github.com/ddzz))


## v3.0.3 (2022-09-26)

#### :bug: Bug Fix
* [#534](https://github.com/bmish/check-dependency-version-consistency/pull/534) Ignore package.json comments ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v3.0.2 (2022-09-23)

#### :bug: Bug Fix
* [#527](https://github.com/bmish/check-dependency-version-consistency/pull/527) Ignore packages inside `node_modules` from `nohoist` usage ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v3.0.1 (2022-09-06)

#### :bug: Bug Fix
* [#520](https://github.com/bmish/check-dependency-version-consistency/pull/520) Allow referring to local package version with `workspace:` prefix ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#423](https://github.com/bmish/check-dependency-version-consistency/pull/423) Add Node v18 to CI ([@ddzz](https://github.com/ddzz))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius Dzien ([@ddzz](https://github.com/ddzz))


## v3.0.0 (2022-03-27)

#### :boom: Breaking Change
* [#348](https://github.com/bmish/check-dependency-version-consistency/pull/348) Check `resolutions` for inconsistencies ([@bmish](https://github.com/bmish))
* [#379](https://github.com/bmish/check-dependency-version-consistency/pull/379) Consider nested workspaces ([@dobesv](https://github.com/dobesv))

#### Committers: 3
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius D. ([@ddzz](https://github.com/ddzz))
- Dobes Vandermeer ([@dobesv](https://github.com/dobesv))


## v2.0.4 (2022-03-18)

#### :bug: Bug Fix
* [#381](https://github.com/bmish/check-dependency-version-consistency/pull/381) Support object-style workspace package config in package.json ([@bipinpoudyal](https://github.com/bipinpoudyal))

#### Committers: 2
- Bipin Poudyal ([@bipinpoudyal](https://github.com/bipinpoudyal))
- Darius D. ([@ddzz](https://github.com/ddzz))


## v2.0.3 (2022-02-22)

#### :bug: Bug Fix
* [#358](https://github.com/bmish/check-dependency-version-consistency/pull/358) Autofix to increased latest version range ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v2.0.2 (2022-02-20)

#### :bug: Bug Fix
* [#355](https://github.com/bmish/check-dependency-version-consistency/pull/355) Maintain range type when fixing to local package version ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v2.0.1 (2022-02-17)

#### :bug: Bug Fix
* [#347](https://github.com/bmish/check-dependency-version-consistency/pull/347) Improve handling of local package version inconsistencies ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v2.0.0 (2022-02-14)

#### :boom: Breaking Change
* [#343](https://github.com/bmish/check-dependency-version-consistency/pull/343) Check local package version consistency ([@bmish](https://github.com/bmish))

#### :rocket: Enhancement
* [#342](https://github.com/bmish/check-dependency-version-consistency/pull/342) build(deps): bump globby from 12.2.0 to 13.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :memo: Documentation
* [#330](https://github.com/bmish/check-dependency-version-consistency/pull/330) Use `latest` version instead of `highest` version ([@ddzz](https://github.com/ddzz))
* [#329](https://github.com/bmish/check-dependency-version-consistency/pull/329) Improve completeness of example in README ([@bmish](https://github.com/bmish))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius D. ([@ddzz](https://github.com/ddzz))


## v1.6.0 (2022-01-18)

#### :rocket: Enhancement
* [#320](https://github.com/bmish/check-dependency-version-consistency/pull/320) Display which dependencies were fixed when running with `--fix` ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#324](https://github.com/bmish/check-dependency-version-consistency/pull/324) Avoid publishing unnecessary files ([@bmish](https://github.com/bmish))

#### :memo: Documentation
* [#315](https://github.com/bmish/check-dependency-version-consistency/pull/315) Add more detailed README example section ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#316](https://github.com/bmish/check-dependency-version-consistency/pull/316) Add `eslint-plugin-jest` and update tests ([@ddzz](https://github.com/ddzz))
* [#313](https://github.com/bmish/check-dependency-version-consistency/pull/313) Update to `@types/edit-json-file` 1.7.0 and remove `ts-ignore` comment ([@bmish](https://github.com/bmish))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius D. ([@ddzz](https://github.com/ddzz))


## v1.5.0 (2022-01-11)

#### :rocket: Enhancement
* [#303](https://github.com/bmish/check-dependency-version-consistency/pull/303) Add options `--ignore-path` and `--ignore-path-pattern` ([@bmish](https://github.com/bmish))
* [#301](https://github.com/bmish/check-dependency-version-consistency/pull/301) Add option `--ignore-package-pattern` ([@bmish](https://github.com/bmish))
* [#215](https://github.com/bmish/check-dependency-version-consistency/pull/215) Add option `--ignore-package` and switch to displaying actual package names ([@bmish](https://github.com/bmish))
* [#298](https://github.com/bmish/check-dependency-version-consistency/pull/298) Add option `--ignore-dep-pattern` ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#299](https://github.com/bmish/check-dependency-version-consistency/pull/299) Fix incorrect autofix for nested dependency ([@tamslinn](https://github.com/tamslinn))

#### :memo: Documentation
* [#288](https://github.com/bmish/check-dependency-version-consistency/pull/288) Update badge links in README ([@ddzz](https://github.com/ddzz))
* [#285](https://github.com/bmish/check-dependency-version-consistency/pull/285) Update filename formatting in README ([@ddzz](https://github.com/ddzz))

#### :house: Internal
* [#300](https://github.com/bmish/check-dependency-version-consistency/pull/300) Switch to jest for snapshot testing ([@bmish](https://github.com/bmish))
* [#296](https://github.com/bmish/check-dependency-version-consistency/pull/296) Add `.DS_Store` file to `.gitignore` ([@ddzz](https://github.com/ddzz))

#### Committers: 3
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius D. ([@ddzz](https://github.com/ddzz))
- Tamsin ([@tamslinn](https://github.com/tamslinn))


## v1.4.2 (2021-12-08)

#### :bug: Bug Fix
* [#275](https://github.com/bmish/check-dependency-version-consistency/pull/275) Avoid crash when abnormal version present ([@bmish](https://github.com/bmish))
* [#271](https://github.com/bmish/check-dependency-version-consistency/pull/271) Correctly expand globs in workspace paths ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#253](https://github.com/bmish/check-dependency-version-consistency/pull/253) Add GitHub Actions to Dependabot config ([@ddzz](https://github.com/ddzz))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius D. ([@ddzz](https://github.com/ddzz))


## v1.4.1 (2021-10-28)

#### :bug: Bug Fix
* [#241](https://github.com/bmish/check-dependency-version-consistency/pull/241) Don't ignore workspace root package.json ([@bmish](https://github.com/bmish))
* [#242](https://github.com/bmish/check-dependency-version-consistency/pull/242) Maintain newline at end of package.json file ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#243](https://github.com/bmish/check-dependency-version-consistency/pull/243) Test under Node 17 ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v1.4.0 (2021-10-12)

#### :rocket: Enhancement
* [#206](https://github.com/bmish/check-dependency-version-consistency/pull/206) Bold maximum usage count for each mismatched dependency ([@bmish](https://github.com/bmish))
* [#205](https://github.com/bmish/check-dependency-version-consistency/pull/205) Improve discoverability of `fix` option ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#238](https://github.com/bmish/check-dependency-version-consistency/pull/238) Fix autofixer when dots are present in dependency name ([@bmish](https://github.com/bmish))

#### :house: Internal
* [#237](https://github.com/bmish/check-dependency-version-consistency/pull/237) Improve autofixer test coverage ([@bmish](https://github.com/bmish))
* [#214](https://github.com/bmish/check-dependency-version-consistency/pull/214) Add dependency caching to CI ([@ddzz](https://github.com/ddzz))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius Dzien ([@ddzz](https://github.com/ddzz))


## v1.3.0 (2021-09-09)

#### :rocket: Enhancement
* [#198](https://github.com/bmish/check-dependency-version-consistency/pull/198) Show list of packages containing each dependency version ([@bmish](https://github.com/bmish))
* [#197](https://github.com/bmish/check-dependency-version-consistency/pull/197) Use table to display mismatching version output ([@bmish](https://github.com/bmish))
* [#189](https://github.com/bmish/check-dependency-version-consistency/pull/189) Display dependency versions in descending instead of ascending order ([@ddzz](https://github.com/ddzz))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius Dzien ([@ddzz](https://github.com/ddzz))


## v1.2.0 (2021-09-07)

#### :rocket: Enhancement
* [#194](https://github.com/bmish/check-dependency-version-consistency/pull/194) Make path argument optional ([@ddzz](https://github.com/ddzz))
* [#185](https://github.com/bmish/check-dependency-version-consistency/pull/185) Improve output formatting for mismatched versions ([@ddzz](https://github.com/ddzz))

#### :bug: Bug Fix
* [#184](https://github.com/bmish/check-dependency-version-consistency/pull/184) Remove clutter from error message output ([@ddzz](https://github.com/ddzz))

#### :memo: Documentation
* [#192](https://github.com/bmish/check-dependency-version-consistency/pull/192) Describe motivation in README ([@bmish](https://github.com/bmish))

#### Committers: 2
- Bryan Mishkin ([@bmish](https://github.com/bmish))
- Darius Dzien ([@ddzz](https://github.com/ddzz))


## v1.1.0 (2021-09-04)

#### :rocket: Enhancement
* [#177](https://github.com/bmish/check-dependency-version-consistency/pull/177) Implement autofixing ([@bmish](https://github.com/bmish))
* [#178](https://github.com/bmish/check-dependency-version-consistency/pull/178) Sort mismatching version output by version number ([@bmish](https://github.com/bmish))
* [#174](https://github.com/bmish/check-dependency-version-consistency/pull/174) Add help description to CLI `path` argument ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#171](https://github.com/bmish/check-dependency-version-consistency/pull/171) Use native JS array `flatMap` ([@bmish](https://github.com/bmish))

#### :memo: Documentation
* [#175](https://github.com/bmish/check-dependency-version-consistency/pull/175) Mention related tool `npm-package-json-lint` in README ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v1.0.0 (2021-08-31)

#### :boom: Breaking Change
* [#159](https://github.com/bmish/check-dependency-version-consistency/pull/159) Convert to ESM ([@bmish](https://github.com/bmish))
* [#160](https://github.com/bmish/check-dependency-version-consistency/pull/160) Drop Node 10 support ([@bmish](https://github.com/bmish))

#### :rocket: Enhancement
* [#149](https://github.com/bmish/check-dependency-version-consistency/pull/149) build(deps): bump commander from 7.2.0 to 8.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### :bug: Bug Fix
* [#169](https://github.com/bmish/check-dependency-version-consistency/pull/169) Remove unused dependency `globby` ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.3.0 (2021-05-08)

#### :rocket: Enhancement
* [#88](https://github.com/bmish/check-dependency-version-consistency/pull/88) Exit with failure when unnecessarily specifying `--ignore-dep` CLI option ([@bmish](https://github.com/bmish))

#### :bug: Bug Fix
* [#95](https://github.com/bmish/check-dependency-version-consistency/pull/95) Add real package.json types from type-fest ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## v0.2.0 (2021-03-13)

#### :rocket: Enhancement
* [#59](https://github.com/bmish/check-dependency-version-consistency/pull/59) Show count of each mismatching version for a dependency ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))


## 0.1.1 (2020-12-28)

#### :bug: Bug Fix
* [#2](https://github.com/bmish/check-dependency-version-consistency/pull/2) Remove unused js-yaml dependency ([@bmish](https://github.com/bmish))

#### :memo: Documentation
* [#6](https://github.com/bmish/check-dependency-version-consistency/pull/6) Add MIT license ([@bmish](https://github.com/bmish))
* [#5](https://github.com/bmish/check-dependency-version-consistency/pull/5) Add some package.json keywords ([@bmish](https://github.com/bmish))
* [#4](https://github.com/bmish/check-dependency-version-consistency/pull/4) Clarify a few aspects of the README ([@bmish](https://github.com/bmish))

#### Committers: 1
- Bryan Mishkin ([@bmish](https://github.com/bmish))

## 0.1.0 (2020-12-25)

* Initial version
