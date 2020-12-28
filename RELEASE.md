# Release Instructions

Follow these steps to create a new release (must have release permissions on GitHub and NPM):

1. Check that notable PRs since the last release are labeled and have clear and consistent titles

2. `git pull` the latest master and ensure that `git status` shows no local changes

3. `yarn release` (uses [release-it](https://github.com/release-it/release-it) to handle changelog, publishing, etc)
