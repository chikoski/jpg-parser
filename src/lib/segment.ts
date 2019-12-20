export const identifier = 0xFF;

export class Segment {
  readonly data: DataView;
  constructor(data: DataView) {
    this.data = data;
  }
  get marker() {
    return this.data.getUint8(1);
  }
  get size() {
    return this.data.getUint16(2);
  }
  debugString() {
    return `Unknown segment(marker = ${this.marker.toString(16)}}`;
  }
}

export class SOI extends Segment {
  get size() {
    return 0;
  }
  debugString() {
    return `SOI`;
  }
}

export class SOF extends Segment {
  get width() {
    return this.data.getUint16(7);
  }
  get height() {
    return this.data.getUint16(5);
  }
  debugString() {
    return `SOF(${this.width} x ${this.height})`;
  }
}

export class APP extends Segment {
  get type() {
    return this.marker & 0x0F;
  }
  debugString() {
    return `APP${this.type} (${this.size}bytes)`;
  }
}

export class EOI extends Segment {
  get size() {
    return 0;
  }
  debugString() {
    return `EOI`;
  }
}

export class SOS extends Segment {
  debugString() {
    return `SOS`;
  }
}

const markerSegmentTable = new Map([
  [0xD8, SOI],
  [0xC0, SOF],
  [0xD9, EOI],
  [0xDA, SOS],
  [0xE0, APP],
  [0xE1, APP],
  [0xE2, APP],
  [0xE3, APP],
  [0xE4, APP],
  [0xE5, APP],
  [0xE6, APP],
  [0xE7, APP],
  [0xE8, APP],
  [0xE9, APP],
  [0xEA, APP],
  [0xEB, APP],
  [0xEE, APP],
  [0xEF, APP],
]);

function resolve(type: number) {
  const klass = markerSegmentTable.get(type);
  return klass ? klass : Segment;
};

function isSegment(marker: number): boolean {
  return marker === 0xFF;
}

export function slice(data: DataView, offset: number, size: number): DataView {
  return new DataView(data.buffer, data.byteOffset + offset, size);
}

export function parse(data: DataView, offset = 0): Segment|null {
  const marker = [data.getUint8(offset), data.getUint8(offset + 1)];
  if (isSegment(marker[0])) {
    const Klass = resolve(marker[1]);
    let size = 2;
    if (Klass !== EOI && Klass !== SOI) {
      size = data.getUint16(2);
    }
    const s = slice(data, offset, size);
    return new Klass(s);
  }
  return null;
}