import {DHT, DQT, JPEGFile, parse} from '../lib/index';

function clone(file: JPEGFile): JPEGFile|null {
  const buffer = file.rawData.buffer.slice(0);
  return parse(new DataView(buffer));
}

function generateRandomIndexWith(base: number, size: number): number {
  return (size * Math.random()) | 0 + base;
}

function generateRandomUInt8Value(): number {
  return (0xFF * Math.random()) | 0;
}

function breakDQT(dqt: DQT) {
  const size = dqt.size - 3;
  const index = generateRandomIndexWith(size, 3);
  const value = generateRandomUInt8Value();
  dqt.data.setUint8(index, value);
}

function breakDHT(dht: DHT) {
  const base = dht.getOffsetOf(0);
  const size = dht.size - base;
  const indices = [
    generateRandomIndexWith(size, base), generateRandomIndexWith(size, base)
  ];
  const values = indices.map(index => dht.data.getUint8(index));
  dht.data.setUint8(indices[0], values[1]);
}

function breakImageData(data: DataView, trial = 10) {
  trial = Math.max(trial, 0);
  while (trial > 0) {
    const indices = [
      generateRandomIndexWith(0, data.byteLength),
      generateRandomIndexWith(0, data.byteLength)
    ];
    const size = (Math.min(1024, data.byteLength) * Math.random()) | 0;
    for (let offset = 0; offset < size; offset++) {
      const value = data.getUint8(indices[0] + offset);
      try {
        data.setUint8(indices[1], value);
      } catch (e) {
      }
    }
    trial--;
  }
}

export function glitch(file: JPEGFile): JPEGFile|null {
  const target = clone(file);
  if (target != null) {
    const dqt = target.DQT[0];
    if (dqt != null) {
      breakDQT(dqt);
    }
    const dht = target.DHT[0];
    if (dht != null) {
      breakDHT(dht);
    }
    breakImageData(target.imageData);
  }
  return target;
}