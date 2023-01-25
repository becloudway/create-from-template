#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import winston from 'winston';

import webpack from 'webpack';
import nodeExternals from 'webpack-node-externals';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';

import { $ } from 'zx';
import { createRequire } from 'node:module';

const { npm_package_name: npmPackageName, PROJECT_CWD, npm_package_version: npmPackageVersion } = process.env;

const bundleFolderRelative = `/dist/build/${npmPackageName}`;
const bundleFolder = `${PROJECT_CWD}${bundleFolderRelative}`;

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.simple(), winston.format.cli()),
});

const getLibraryNames = async () => {
  const libFolderNames = (await $`ls ${PROJECT_CWD}/libraries`).stdout.split(/\s+/).filter((s) => s.length);
  const reqre = createRequire(`${PROJECT_CWD}/libraries`);
  const libNames = libFolderNames.map((f) => reqre(`${PROJECT_CWD}/libraries/${f}/package.json`).name);
  logger.verbose(`Found library folders ${libNames}`);
  return libNames;
};

const webpackConfiguration = (libNames) => ({
  mode: 'production',
  entry: './src/main.ts',
  externalsPresets: { node: true },
  externals: [
    nodeExternals(),
    nodeExternals({
      modulesDir: `${PROJECT_CWD}/node_modules`,
      allowlist: (name) => libNames.includes(name),
    }),
  ],
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: ['.ts', '.tsx', '.js'],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
      '.js': ['.js', '.ts'],
      '.cjs': ['.cjs', '.cts'],
      '.mjs': ['.mjs', '.mts'],
    },
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
  module: {
    rules: [
      // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
      { test: /\.([cm]?ts|tsx)$/, loader: 'ts-loader', exclude: /node_modules/ },
    ],
  },
  output: {
    path: bundleFolder,
    filename: 'index.bundle.js',
    clean: true,
  },
});

const webpackPromise = (config) =>
  new Promise((accept, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        logger.error((err.stack && err.stack.toString()) || err);
        if (err.details) {
          logger.error(err.details);
        }
        reject(err);
        return;
      }

      logger.info(
        stats.toString({
          colors: true,
        }),
      );

      if (stats.hasErrors()) {
        reject();
      }
      accept();
    });
  });

const script = async (flags) => {
  logger.info(`Building package ${npmPackageName}@${npmPackageVersion}`);
  logger.verbose(`Using flags ${JSON.stringify(flags)}`);
  const libNames = await getLibraryNames();
  await webpackPromise(webpackConfiguration(libNames));

  const packageNameForDocker = npmPackageName.replace('@', '');
  await $`docker build -f ${PROJECT_CWD}/Dockerfile --no-cache --build-arg BUNDLE_FOLDER=${bundleFolderRelative} --build-arg WORKSPACE_NAME=${npmPackageName} --force-rm --pull -t ${packageNameForDocker}:${npmPackageVersion} -t ${packageNameForDocker}:latest ${PROJECT_CWD}`;

  logger.verbose(`Files bundled and available in ${bundleFolder.replace(PROJECT_CWD, '.')}`);
};

const { verbose } = yargs(hideBin(process.argv))
  .option('verbose', {
    description: 'Enable verbose logging.',
    boolean: true,
    default: false,
    alias: 'v',
  })
  .help().argv;

if (verbose) {
  logger.level = 'verbose';
}

script({ verbose }).catch((err) => {
  logger.error(err);
  process.exit(1);
});
