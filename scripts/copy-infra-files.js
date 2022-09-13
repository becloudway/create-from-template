#!/usr/bin/env node
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import * as fs from 'fs/promises';
import copyfiles from 'copyfiles';
import winston from 'winston';

const { PROJECT_CWD } = process.env;

const infrastructureFolder = `${PROJECT_CWD}/infrastructure/`;
const targetFolder = `${PROJECT_CWD}/dist/build/`;

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(winston.format.simple(), winston.format.cli()),
});

const copyFilesPromise = (src, target) =>
  new Promise((accept, reject) => {
    copyfiles([...src, target], { up: true }, (err) => (err ? reject(err) : accept()));
  });

const script = async (flags) => {
  logger.info(`Copying infra files`);
  logger.verbose(`Using flags ${JSON.stringify(flags)}`);

  // copy files
  logger.verbose(`Copying the infra files from ${infrastructureFolder.replace(PROJECT_CWD, '.')}`);
  const directoriesToCopy = (
    await Promise.all(
      (await fs.readdir(infrastructureFolder)).map(async (f) => ({ name: f, isDir: (await fs.stat(f)).isDirectory() })), // List all directories in the folder and determine whether or not they are directories
    )
  )
    .filter(({ name, isDir }) => isDir && !name.startsWith('.')) // filter out non-directories and hidden directories
    .map(({ name }) => `./${name}/**`); // map again to only retain the path (with glob) for the next step.
  logger.verbose(`Copying from the following directories: ${directoriesToCopy.join(', ')}`);
  await copyFilesPromise(directoriesToCopy, targetFolder);

  logger.info(`All files copied and available in ${targetFolder.replace(PROJECT_CWD, '.')}`);
};

const { verbose } = yargs(hideBin(process.argv))
  .usage('$0', 'Copy the necessary infra files into the build folder')
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
