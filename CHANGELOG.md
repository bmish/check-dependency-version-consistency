# check-dependency-version-consistency







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
