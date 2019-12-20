import { parse as parseSegment, Segment, slice, SOS } from './segment';

export class JPEGFile {
  readonly segments: Array<Segment>;
  readonly data: DataView;
  constructor(segments: Array<Segment>, data: DataView) {
    this.segments = segments;
    this.data = data;
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

export function parse(data: DataView) {
  console.info("start parsing");
  let segments: Array<Segment> = [];
  let offset = 0;
  while (offset < data.byteLength) {
    console.debug(`offset = ${offset}`);
    const seg = parseSegment(data, offset);
    console.debug(seg?.debugString());
    if (seg != null) {
      segments.push(seg);
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
    segments.push(eoi);
  }
  const scanArea = slice(data, offset, end - offset);

  return new JPEGFile(segments, scanArea);
};