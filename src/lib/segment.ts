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

export class DQT extends Segment {
  debugString() {
    return `DQT`
  }
}

export class DHT extends Segment {
  get tableClass(): number {
    return this.data.getUint8(2) >>> 4;
  }
  get tc(): number {
    return this.tableClass;
  }
  get tableIndex(): number {
    return this.data.getUint8(2) & 0x0F;
  }
  get th(): number {
    return this.tableIndex;
  }
  get l1(): number {
    return this.getLengthOf(1);
  }
  get l2(): number {
    return this.getLengthOf(2);
  }
  get l3(): number {
    return this.getLengthOf(3);
  }
  get l4(): number {
    return this.getLengthOf(4);
  }
  get l5(): number {
    return this.getLengthOf(5);
  }
  get l6(): number {
    return this.getLengthOf(6);
  }
  get l7(): number {
    return this.getLengthOf(7);
  }
  get l8(): number {
    return this.getLengthOf(8);
  }
  get l9(): number {
    return this.getLengthOf(9);
  }
  get l10(): number {
    return this.getLengthOf(10);
  }
  get l11(): number {
    return this.getLengthOf(11);
  }
  get l12(): number {
    return this.getLengthOf(12);
  }
  get l13(): number {
    return this.getLengthOf(13);
  }
  get l14(): number {
    return this.getLengthOf(14);
  }
  get l15(): number {
    return this.getLengthOf(15);
  }
  get l16(): number {
    return this.getLengthOf(16);
  }
  getLengthOf(index: number): number {
    const normalized = this.normalizeIndex(index);
    return this.data.getUint8(normalized + 3);
  }
  getOffsetOf(index: number): number {
    const normalized = this.normalizeIndex(index);
    let offset = 19;
    for (let i = 0; i < normalized; i++) {
      offset += this.getLengthOf(i);
    }
    return offset;
  }

  getValueOf(index: number): DataView {
    const normalized = this.normalizeIndex(index);
    const offset = this.getOffsetOf(normalized);
    const length = this.getLengthOf(normalized);
    return new DataView(
        this.data.buffer, this.data.byteOffset + offset, length);
  }

  private normalizeIndex(index: number): number {
    return Math.min(Math.max(index, 0), 16);
  }

  debugString() {
    const className = this.tableClass === 1 ? 'AC' : 'DC';
    return `DHT (${className}, ${this.tableIndex}); ${this.size} bytes`;
  }
}

const markerSegmentTable = new Map([
  [0xD8, SOI], [0xC0, SOF], [0xC1, SOF], [0xC4, DHT], [0xD9, EOI], [0xDA, SOS],
  [0xDB, DQT], [0xE0, APP], [0xE1, APP], [0xE2, APP], [0xE3, APP], [0xE4, APP],
  [0xE5, APP], [0xE6, APP], [0xE7, APP], [0xE8, APP], [0xE9, APP], [0xEA, APP],
  [0xEB, APP], [0xEC, APP], [0xED, APP], [0xEE, APP], [0xEF, APP],
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