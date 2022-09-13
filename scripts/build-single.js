#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import esbuild from 'esbuild';
// import Archiver from 'archiver';
// import * as fs from 'fs';
import copyfiles from 'copyfiles';
// import prettyBytes from 'pretty-bytes';
import winston from 'winston';

const { npm_package_name: npmPackageName, PROJECT_CWD, npm_package_version: npmPackageVersion } = process.env;

const bundleFolder = `${PROJECT_CWD}/dist/build/${npmPackageName}`;
// const zipFolder = `${PROJECT_CWD}/dist/${npmPackageVersion}/`;
// const zipTarget = `${zipFolder}${npmPackageName}-${npmPackageVersion}.zip`;

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.simple(), winston.format.cli()),
});

const copyFilesPromise = (filesToCopy) =>
  new Promise((accept, reject) => {
    copyfiles([...filesToCopy, bundleFolder], { up: 1 }, (err) => (err ? reject(err) : accept()));
  });

const script = async (filesToCopy, flags) => {
  logger.info(`Building package ${npmPackageName}@${npmPackageVersion}`);
  logger.verbose(`Using flags ${JSON.stringify(flags)}`);
  // bundle
  esbuild.buildSync({
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node16',
    treeShaking: true,
    logLevel: flags.verbose ? 'debug' : 'info',
    outdir: bundleFolder,
    legalComments: 'none',
    external: ['aws-sdk'],
    entryPoints: ['./src/index.ts'],
    tsconfig: `./tsconfig.json`,
  });

  // copy files
  if (filesToCopy.length > 0) {
    logger.verbose(`Copying the following files to be zipped ${filesToCopy.join(', ')}`);
    await copyFilesPromise(filesToCopy);
    logger.info('Done copying files');
  }

  logger.verbose(`Files bundled and available in ${bundleFolder.replace(PROJECT_CWD, '.')}`);

  // // zip
  // logger.verbose('Start creating zip');
  // const output = fs.createWriteStream(zipTarget);
  // await fs.promises.mkdir(zipFolder, { recursive: true });
  // const zipper = new Archiver('zip', { zlib: { level: 9 } });
  // return new Promise((resolve, reject) => {
  //   output.on('close', () => {
  //     logger.info(`Zip file created ${zipTarget.replace(PROJECT_CWD, '.')} ${prettyBytes(zipper.pointer())}`);
  //     resolve();
  //   });
  //   output.on('error', reject);
  //   zipper.pipe(output);
  //   zipper.directory(bundleFolder, false);
  //   zipper.finalize();
  // });
};

const { _: filesToCopy, verbose } = yargs(hideBin(process.argv))
  .command('[files-to-copy]', 'Bundle and zip a single package')
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

script(filesToCopy, { verbose }).catch((err) => {
  logger.error(err);
  process.exit(1);
});
