import { parse, JPEGFile, DQT } from "../lib/index";

function clone(file: JPEGFile): JPEGFile | null {
  const buffer = file.rawData.buffer.slice(0);
  return parse(new DataView(buffer));
}

export function glitch(file: JPEGFile): JPEGFile | null {
  const target = clone(file);
  if (target != null) {
    const dqt = target.DQT[0];
    if (dqt != null) {
      const index = (dqt.size * Math.random()) | 0;
      const value = (Math.random() * 0xFF) | 0;
      dqt.data.setUint8(index, value);
    }
  }
  return target;
}