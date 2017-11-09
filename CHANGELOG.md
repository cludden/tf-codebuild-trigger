# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.3"></a>
## [1.0.3](https://github.com/cludden/tf-codebuild-trigger/compare/v1.0.2...v1.0.3) (2017-11-09)


### Bug Fixes

* makes parameter overrides optional ([307715f](https://github.com/cludden/tf-codebuild-trigger/commit/307715f))



<a name="1.0.2"></a>
## [1.0.2](https://github.com/cludden/tf-codebuild-trigger/compare/v1.0.1...v1.0.2) (2017-11-09)


### Bug Fixes

* set `eventName` using `record.Sns.Subject` ([4c80a0b](https://github.com/cludden/tf-codebuild-trigger/commit/4c80a0b))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/cludden/tf-codebuild-trigger/compare/v1.0.0...v1.0.1) (2017-11-09)


### Bug Fixes

* disables `callbackWaitsForEmptyEventLoop` to prevent function timeouts ([c21971e](https://github.com/cludden/tf-codebuild-trigger/commit/c21971e))
* renames `CONFIG_PARAMETER_NAME` to `CONFIG_PARAMETER_NAMES` ([710b96d](https://github.com/cludden/tf-codebuild-trigger/commit/710b96d))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/cludden/tf-codebuild-trigger/compare/v0.1.3...v1.0.0) (2017-11-07)


### Features

* refactors to support encrypted configuration and ES2015 ([7eec4ab](https://github.com/cludden/tf-codebuild-trigger/commit/7eec4ab))


### BREAKING CHANGES

* this release is not compatible with previous releases



<a name="0.1.3"></a>
## [0.1.3](https://github.com/cludden/tf-codebuild-trigger/compare/v0.1.2...v0.1.3) (2017-10-11)


### Bug Fixes

* update iam resources to use stack name for consistency ([feecedd](https://github.com/cludden/tf-codebuild-trigger/commit/feecedd))



<a name="0.1.2"></a>
## [0.1.2](https://github.com/cludden/tf-codebuild-trigger/compare/v0.1.1...v0.1.2) (2017-10-11)


### Bug Fixes

* use remote state instead of variables ([fbd1e1e](https://github.com/cludden/tf-codebuild-trigger/commit/fbd1e1e))



<a name="0.1.1"></a>
## [0.1.1](https://github.com/cludden/tf-codebuild-trigger/compare/v0.1.0...v0.1.1) (2017-10-11)


### Bug Fixes

* include build artifact in version control for ease of deployment ([596909a](https://github.com/cludden/tf-codebuild-trigger/commit/596909a))



<a name="0.1.0"></a>
# 0.1.0 (2017-10-11)


### Features

* initial release ([43cccc3](https://github.com/cludden/tf-codebuild-trigger/commit/43cccc3))
