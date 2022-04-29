import { ncp } from 'ncp';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { green, red, bold } from 'kleur/colors';

export interface CreateResult {
  error?: string;
  message?: string;
}

export const create = (dir: string, name: string): Promise<CreateResult> => {
  const from = resolve(__dirname, '../../assets'),
    to = resolve(dir);
  return new Promise((r) => {
    ncp(from, to, (err: Error[]) => {
      if (err) {
        const msg = err.map((next: Error) => next?.message);
        r({
          error: bold(
            red(`\nThere was an error while setting up ${name}\n(${msg})`)
          ),
        });
      } else {
        const pkg = JSON.parse(
          readFileSync(resolve(to, 'package.json'), 'utf-8')
        );
        pkg.name = name;
        writeFileSync(
          resolve(to, 'package.json'),
          JSON.stringify(pkg, null, 4),
          'utf-8'
        );
        const indexFile = readFileSync(resolve(to, 'src/index.ts'), 'utf-8');
        const updatedContent = indexFile.replace('~TODO~', name);
        writeFileSync(resolve(to, 'src/index.ts'), updatedContent, 'utf-8');
        r({ message: bold(green(`\nYour project, '${name}' is ready!`)) });
      }
    });
  });
};
