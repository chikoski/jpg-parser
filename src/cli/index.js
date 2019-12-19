import oldfs from 'fs'
import path from 'path'
import {parse} from '../index';

const fs = oldfs.promises;

async function read(file) {
  const res = await fs.readFile(file);
  console.log(res.byteOffset);
  return new DataView(res.buffer, res.byteOffset, res.byteLength);
}

async function main(args) {
  const file = args[0];
  const fullPath = file[0] === '/' ? file : path.resolve(process.cwd(), file);

  const data = await read(fullPath);
  const jpg = parse(data);
  console.log(jpg);
}

main(process.argv.slice(2));
