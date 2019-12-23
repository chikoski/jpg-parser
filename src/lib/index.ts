import {DHT, DQT, EOI, parse as parseSegment, Segment, slice, SOF, SOI, SOS} from './segment';

export {DHT, DQT, Segment} from './segment';

export class JPEGFile {
  readonly segments: Array<Segment>;
  readonly imageData: DataView;
  readonly rawData: DataView;
  readonly DQT: Array<DQT>;
  readonly DHT: Array<DHT>;
  readonly SOF: SOF;

  constructor(conf: ParseResult) {
    const {segments, imageData, sof, dqt, dht, rawData} = conf;
    this.segments = segments;
    this.imageData = imageData;
    this.SOF = sof;
    this.DQT = dqt;
    this.DHT = dht;
    this.rawData = rawData;
  }
  get width(): number {
    return this.SOF.width;
  }
  get height(): number {
    return this.SOF.height;
  }

  debugString() {
    return `${this.segments.map(i => i.debugString()).join('\n')}`;
  }
}

function getSegmentSize(segment: Segment): number {
  if (!(segment instanceof Segment)) {
    return 0;
  }
  return segment.size + 2;
}

class IR {
  soi: SOI;
  sof: SOF|null = null;
  eoi: EOI|null = null;
  dqt: Array<DQT> = [];
  dht: Array<DHT> = [];
  segments: Array<Segment> = [];
  imageData: DataView|null = null;
  rawData: DataView|null = null;
  constructor(soi: SOI) {
    this.soi = soi;
    this.segments.push(soi);
  }
  add(seg: Segment) {
    this.segments.push(seg);
    if (seg instanceof SOF) {
      this.sof = seg;
    }
    if (seg instanceof DQT) {
      this.dqt.push(seg);
    }
    if (seg instanceof DHT) {
      this.dht.push(seg);
    }
    if (seg instanceof EOI) {
      this.eoi = seg;
    }
  }
}

interface ParseResult {
  sof: SOF, dht: Array<DHT>, dqt: Array<DQT>, segments: Array<Segment>,
      imageData: DataView, rawData: DataView
}

export function parse(data: DataView): JPEGFile|null {
  const soi = parseSegment(data, 0);
  if (!(soi instanceof SOI)) {
    return null;
  }

  let offset = 2;
  const ir = new IR(soi);
  while (offset < data.byteLength) {
    const seg = parseSegment(data, offset);
    if (seg != null) {
      ir.add(seg);
      offset += getSegmentSize(seg);
      if (seg instanceof SOS) {
        break;
      }
    } else {
      return null;
    }
  }
  let end = data.byteLength - 2;
  while (offset < end) {
    if (data.getUint16(end) === 0xFFD9) {
      break;
    }
    end--;
  }
  const eoi = parseSegment(data, end);
  if (eoi != null) {
    ir.add(eoi);
  }
  ir.imageData = slice(data, offset, end - offset);
  ir.rawData = slice(data, 0, data.byteLength);
  if (ir.eoi != null && ir.sof != null && ir.imageData != null &&
      ir.rawData != null) {
    return new JPEGFile(ir as ParseResult);
  }
  return null;
}