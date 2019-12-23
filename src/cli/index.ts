import oldfs from 'fs';
import path from 'path';

import {JPEGFile, parse} from '../lib/index';

import {glitch} from './glitch';

const fs = oldfs.promises;

function normalize(mayFullPath: string): string {
  return mayFullPath[0] === '/' ? mayFullPath :
                                  path.resolve(process.cwd(), mayFullPath);
}

async function read(file: string): Promise<DataView> {
  const res = await fs.readFile(file);
  return new DataView(res.buffer, res.byteOffset, res.byteLength);
}

async function exists(filename: string): Promise<boolean> {
  try {
    await fs.stat(filename);
    return true;
  } catch (e) {
    return false;
  }
}

async function findAvailableDataStoreName(basename: string): Promise<string> {
  if (!await exists(basename)) {
    return basename;
  }
  for (let i = 0;; i++) {
    const name = `${basename}_${i}`;
    if (!await exists(name)) {
      return name;
    }
  }
}

async function createDataStore(basename = 'glitched'): Promise<string> {
  const name = await findAvailableDataStoreName(basename);
  await fs.mkdir(name);
  return name;
}

async function glitchNTimes(src: JPEGFile, n: number) {
  const dir = await createDataStore();
  const digits = (Math.log(n) / Math.log(10)) | 0 + 1;
  while (n > 0) {
    const filename = `${n}`.padStart(digits, '0');
    const fullPath = path.resolve(process.cwd(), dir, `${filename}.jpg`);
    const result = glitch(src);
    if (result != null) {
      const buffer = Buffer.from(result.rawData.buffer);
      await fs.writeFile(fullPath, buffer);
    }
    n--;
  }
}

async function main(args: Array<string>) {
  const normalized = args.map(normalize);
  for (const file of normalized) {
    const data = await read(file);
    const jpg = parse(data);
    if (jpg != null) {
      console.debug(jpg.debugString());
      glitchNTimes(jpg, 100);
    }
  }
}

main(process.argv.slice(2));
