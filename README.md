# semantic-release-paths

> semantic-release-paths is a fork of semantic-release and is not maintained by the same team as semantic-release.

A drop-in replacement for [semantic-release](https://github.com/semantic-release/semantic-release) that includes a `paths` configuration option to filter commits by the changed file paths. While this does enable independent versioning of packages in monorepos - with some [careful configuration](#monorepo) - it is **not** intended as a complete solution for monorepos.

## Motivation

The base implementation of `semantic-release` does not support filtering commits by path and will not be implementing this feature, based on a desire for a more complete solution, outlined by this [issue comment](https://github.com/semantic-release/semantic-release/issues/193#issuecomment-545118972).<br>
As such, `semantic-release` has seen a number of forks, pull-requests, plugins and so on, to satisfy the communities needs. Most notable the [semantic-release-monorepo](https://github.com/pmowrer/semantic-release-monorepo) project and the [semantic-release-path-filter](https://github.com/psm14/semantic-release-path-filter) plugin. `semantic-release-paths` is yet another attempt at a solution.

### semantic-release-monorepo

The [semantic-release-monorepo](https://github.com/pmowrer/semantic-release-monorepo) is a somewhat opinionated solution that only considers file paths that are directly adjacent to the `package.json`. It does not allow you to control the paths themselves, which is problematic if you have workspace dependencies that should trigger a new version of a package. It also forces the `tagFormat` to adopt the name of your package, while not necessarily a bad thing, it might not always be desirable.

### semantic-release-path-filter

The [semantic-release-path-filter](https://github.com/psm14/semantic-release-path-filter) plugin does support a flexible paths configuration, but it falls short with shareable configurations. As the plugin requires you to wrap all other plugins you use with it. When using shared configuration, it is not possible to specify ahead of time the paths of the packages.

### Conclusion

The issues presented for the above solutions could be resolved if parameterized shared configuration were introduced to `semantic-release`. However, at time of writing this feature is not supported, nor does it seem planned for support.

`semantic-release-paths` tries to be a happy medium between `semantic-release-monorepo` and `semantic-release-paths-filter`. An unopinionated way to filter commits based on paths and easily applicable to any release configuration setup.

> There is also a [semantic-release-plus](https://github.com/semantic-release-plus/semantic-release) project that does infact do what this package is trying to achieve, but there hasn't been any commits in several years and it seems out of date with the current version of `semantic-release`.

## Usage

`semantic-release-paths` is a drop-in replacement for [semantic-release](https://github.com/semantic-release/semantic-release)

### Installation

```bash
npm install -D semantic-release-paths
```

### Configuration

As with `semantic-release` proper, you can define your [release configuration](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration) in a number ways. However, with `semantic-release-paths` you have the additional configuration option `paths`, that takes an array of repository relative path globs, and filters the commits passed to the plugins based on matches with the changed file paths.

`package.json`

```json
{
  // ...

  "release": {
    "branches": [
      "main"
    ],
    "paths": [
      "dependency/**"
      "package/**"
    ]
  }

  // ...
}
```

## Monorepo

`semantic-release-paths` is not intended as a complete solution for monorepos, but filtering commits by path does open up `semantic-release` to be used in monorepos and independently version every package in the repo.<br>
In order to use `semantic-release-paths` in a monorepo you should ensure that each independently versioned package has it's own release configuration and a repository-level unique `tagFormat`.

Given the following monorepo folder structure structure:

```
.
├── package-a/
│   └── package.json  <-- package a
├── package-b/
|   └── package.json  <-- package b depends on a
└── package.json      <-- workspace root
```

`package-a/package.json` may contain the release configuration.

```json
{
  "name": "package-a",
  "version": "0.0.0-semantic-release",
  "release": {
    "tagFormat": "package-a-v${version}",
    "branches": ["main"],
    "paths": ["package-a/**"]
  }
}
```

and `package-b/package.json` may contain the release configuration:

```json
{
  "name": "package-b",
  "version": "0.0.0-semantic-release",
  "release": {
    "tagFormat": "package-b-v${version}",
    "branches": ["main"],
    "paths": ["package-a/**", "package-b/**"]
  }
}
```

You would then run `semantic-release-paths` against each package seperately to create a release. For example, in npm workspaces you could use.

```bash
npm exec --workspace=package-a -- semantic-release-paths
npm exec --workspace=package-b -- semantic-release-paths
```
