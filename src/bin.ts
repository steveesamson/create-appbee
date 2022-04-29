#!/usr/bin/env node
import fs from 'fs';
import { resolve, relative as rel, basename } from 'path';
import { bold, cyan, gray, green, red } from 'kleur/colors';
import prompts from 'prompts';
import { create } from './utils';
// import pkg from '../package.json';

const log = console.log;

const pkg = JSON.parse(
  fs.readFileSync(resolve(__dirname, '../package.json'), 'utf-8')
);
// prettier-ignore
const disclaimer = `
${bold(cyan('Welcome to Application-Back-End-Engine, appbee!'))}

Should you have an issue, open it on ${cyan('https://github.com/steveesamson/create-appbee/issues')}.
`;

const { version } = pkg;

async function main() {
  log(gray(`\ncreate-appbee version ${version}`));
  log(disclaimer);

  let cwd = process.argv[2] || '.';
  let exists = false;

  if (cwd === '.') {
    const opts = await prompts([
      {
        type: 'text',
        name: 'dir',
        initial: '.',
        message:
          'Where should we create your project?\n  [Enter to use current directory]',
      },
    ]);

    if (opts.dir) {
      cwd = opts.dir;
    }
  }
  exists = fs.existsSync(cwd);
  if (exists) {
    if (fs.readdirSync(cwd).length > 0) {
      const response = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: 'Directory not empty. Proceed?',
        initial: false,
      });

      if (!response.proceed) {
        process.exit(1);
      }
    }
  }

  const dirName = basename(resolve(cwd));
  log();

  const { error, message } = await create(cwd, dirName);

  if (error) {
    log(error);
    process.exit(1);
  }

  log(message);

  console.log('\nNext steps:');
  let i = 1;

  const relative = rel(process.cwd(), cwd);
  if (relative !== '') {
    console.log(`  ${i++}: ${bold(cyan(`cd ${relative}`))}`);
  }

  console.log(`  ${i++}: ${bold(cyan('yarn'))} (or npm install)`);
  // prettier-ignore
  console.log(`  ${i++}: ${bold(cyan('git init && git add -A && git commit -m "Initial commit"'))} (optional)`);
  console.log(`  ${i++}: ${bold(cyan('yarn dev (or npm run dev)'))}`);
}

main();
