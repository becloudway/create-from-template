# Cloudway template using typescript, nestjs and turborepo for creating container images

## How to add a new app to the monerepo

The easiest way to add a new application to the monorepo is to simply copy one of the existing ones in the `./apps` folder. Do not forget to update the package name in the package.json file. It is also advisable to change the PORT number in the `start:dev` script in said package.json. This will allow you to run multiple apps locally at the same time.

## Project setup

The project is setup as a monorepo using Yarn (v3) workspaces and which uses [Turborepo](https://turborepo.org/) as a task runner.

The project structure is as follows:

| Folder | Purpose |
|--|--|
| **./config**          | Contains packages with internal configuration for managing the monorepo |
| **./apps/\***         | Contains the application packages for deployment as containers |
| **./libraries/\***    | Contains library packages which are used by the apps |
| **./scripts**         | Contains utility scripts |

## Prerequisites

The following needs to be installed:
| Program | |
|---|---|
| node/npm  | Node version 18 with the latest npm. Tip: use [nvm](https://github.com/nvm-sh/nvm) to manage multiple node versions |
| yarn      | Yarn is used for managing the dependencies and running some scripts. Install using `npm -g corepack` |

## Install dependencies

Dependencies can be installed by running the following command in the root of the workspace:

```
yarn
```

(Yes, it's that easy)

## Available Yarn plugins

| Plugin name | Purpose |
|---|---|
| outdated | Provides the `yarn outdated` command to list outdated dependencies throughout the entire monorepo |
| typescript | Will automatically install `@types/` packages if no types are available in the added package itself |
| version | Version management for the entire monorepo. Can be used with the `update-package-versions` command (see below). |
| workspace tools| Provides some commands to work with the workspaces such as `yarn workspaces foreach` or `yarn workspaces focus` |

## Turborepo

The monorepo uses Turborepo as a tool to run several scripts. These scripts are defined in the pipeline of turbo (defined in [./turbo.json](./turbo.json)) and correspond to npm scripts in the different workspaces. If a certain script is not defined for a certain workspace, this is gracefully handled by Turborepo itself. The use of turborepo is mostly transparant for the developer as this is hidden away by using npm scripts in the root of the monorepo.

The following scripts are available and can be run using `yarn <scriptname>`:
| Script name | Purpose | Uses Turborepo |
|---|---|:---:|
| lint      | Run the eslint check. Fails when there are any errors detected. | X |
| lint:fix  | Run the eslint check and fix the issues which can be autofixed. Fails when there are errors detected which could not be fixed. | X |
| test      | Run the tests and generates coverage reports. Fails if any test in any of the workspaces fails. | X |
| build     | Build the entire repository. This includes linting, typechecking and testing the workspaces after which they are bundled, containerized and ready for deployment | X |
| update-package-versions | Update the version for all the workspaces, accepts one parameter, which is the version to set, or how to update the version (major, minor, patch) | |

Any Turborepo script takes the following arguments:

* `--scope=` to limit the effects of the turborepo command to a single package. This is only useful when running commands from the root of the monorepo, you don't need this if you're running an NPM script from the directory of one of the workspaces.
* `--force` to ignore the cached turborepo results
