# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.0.0](https://github.com/defx/synergy/compare/v3.0.2...v4.0.0) (2021-03-29)


### ⚠ BREAKING CHANGES

* Move lifecycle methods back on to model. Source initial values lazily via Proxy from attributes then properties.
* reactive by default
* named indices for repeated blocks
* remove render export and simplify hydration check

### Features

* Move lifecycle methods back on to model. Source initial values lazily via Proxy from attributes then properties. ([68c7807](https://github.com/defx/synergy/commit/68c7807ffa0b49c2359f2a8fb353cbb720b5d0b3))
* named indices for repeated blocks ([ca23d2a](https://github.com/defx/synergy/commit/ca23d2ac82d59f038ca252df0b4f6975af24b1a0))
* reactive by default ([9c53211](https://github.com/defx/synergy/commit/9c53211fd69194f3d51d6a3ed25b6e553ec78bae))
* remove render export and simplify hydration check ([443aebc](https://github.com/defx/synergy/commit/443aebcea2744c3eb2c235ed1a94b14184b76731))
* support optional async factory function for deferred component initialisation ([fbb3ef1](https://github.com/defx/synergy/commit/fbb3ef1d3497cbb2a63f2d3d889fd82de06cc07e))


### Bug Fixes

* initialise inside connectedCallback to allow imperative use with createElement ([b241860](https://github.com/defx/synergy/commit/b2418609bcc990d5710f9ba7061ebd97ff5feb0d))

## [3.0.0](https://github.com/defx/synergy/compare/v2.1.5...v3.0.0) (2021-03-01)


### ⚠ BREAKING CHANGES

* template function invocation syntax
* separate lifecycle hooks from model

### Features

* add declaration file ([83f6c49](https://github.com/defx/synergy/commit/83f6c49836f68f8846ecb9bfefa1a7566fa0e6e6))
* separate lifecycle hooks from model ([dd8e5aa](https://github.com/defx/synergy/commit/dd8e5aacb4756635e8e0774032a0317679d07502))
* square brackets ([27b6da6](https://github.com/defx/synergy/commit/27b6da6df8c019ef87bfbee7d771b7c51bfcc7ca))
* template function invocation syntax ([47ea03f](https://github.com/defx/synergy/commit/47ea03fe67b3060340a4394893915852d96bf888))
