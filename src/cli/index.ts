import path from "path";
import oldfs from "fs";
import { parse } from "../lib/index";

const fs = oldfs.promises;

function normalize(mayFullPath: string): string {
  return mayFullPath[0] === "/" ? mayFullPath : path.resolve(process.cwd(), mayFullPath);
}

async function read(file: string): Promise<DataView> {
  const res = await fs.readFile(file);
  return new DataView(res.buffer, res.byteOffset, res.byteLength);
}

async function main(args: Array<string>) {
  const normalized = args.map(normalize);
  for (const file of normalized) {
    const data = await read(file);
    console.log(data);
    const jpg = parse(data);
    console.log(jpg);
  }
}

main(process.argv.slice(2));
