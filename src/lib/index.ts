import { parse as parseSegment, Segment, slice, SOS, SOI, EOI, DQT, DHT } from './segment';

export { DQT, DHT, Segment } from "./segment";

export class JPEGFile {
  readonly segments: Array<Segment>;
  readonly scanArea: DataView;
  readonly rawData: DataView;
  readonly DQT: Array<DQT>;
  readonly DHT: Array<DHT>
  constructor(rawData: DataView, segments: Array<Segment>, dqt: Array<DQT>, dht: Array<DHT>, scanArea: DataView) {
    this.segments = segments;
    this.scanArea = scanArea;
    this.DQT = dqt;
    this.DHT = dht;
    this.rawData = rawData;
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
  eoi: EOI | null = null;
  dqt: Array<DQT> = [];
  dht: Array<DHT> = [];
  segments: Array<Segment> = [];
  scanArea: DataView | null = null;
  constructor(soi: SOI) {
    this.soi = soi;
    this.segments.push(soi);
  }
  add(seg: Segment) {
    this.segments.push(seg);
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

export function parse(data: DataView): JPEGFile | null {
  console.info("start parsing");
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
  ir.scanArea = slice(data, offset, end - offset);
  const rawData = slice(data, 0, data.byteLength);
  if (ir.eoi != null && ir.scanArea != null && rawData != null) {
    return new JPEGFile(rawData, ir.segments, ir.dqt, ir.dht, ir.scanArea);
  }
  return null;
}