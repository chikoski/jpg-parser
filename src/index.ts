import * as eixf from './exif';
import * as segment from './segment';

export class JPEGFile {
  readonly segments: Array<segment.JPEGSegment>;
  readonly data: DataView;
  constructor(segments, data) {
    this.segments = segments;
    this.data = data;
  }
  debugString() {
    return `${this.segments.map(i => i.debugString()).join('\n')}`;
  }
}

const segmentMap = new Map([
  [0xD8, segment.SOISegment],
  [0xC0, segment.SOFSegment],
  [segment.EOISegment.marker, segment.EOISegment],
  [0xDA, segment.SOSSegment],
  [0xE0, segment.APPSegment],
  [0xE1, segment.APPSegment],
  [0xE2, segment.APPSegment],
  [0xE3, segment.APPSegment],
  [0xE4, segment.APPSegment],
  [0xE5, segment.APPSegment],
  [0xE6, segment.APPSegment],
  [0xE7, segment.APPSegment],
  [0xE8, segment.APPSegment],
  [0xE9, segment.APPSegment],
  [0xEA, segment.APPSegment],
  [0xEB, segment.APPSegment],
  [0xEE, segment.APPSegment],
  [0xEF, segment.APPSegment],
]);

function resolve(type) {
  const klass = segmentMap.get(type);
  return klass ? klass : segment.JPEGSegment;
};

function parseHeader(data, offset = 0) {
  const segments = [];
  const apps = new Map();
  for (let size = 1; offset < data.byteLength; offset = offset + size) {
    const id = data.getUint8(offset);
    if (id === segment.identifier) {
      const type = data.getUint8(offset + 1);
      const klass = resolve(type);
      size = 2;
      if (klass !== segment.SOISegment && klass !== segment.EOISegment) {
        size += data.getUint16(offset + 2);
      }
      const slice = new DataView(data.buffer, data.byteOffset + offset, size);
      const seg = new klass(slice);
      if (seg instanceof segment.APPSegment) {
        if (!apps.has(seg.type)) {
          apps.set(seg.type, []);
        }
        apps.get(seg.type).push(seg);
      }
      segments.push(seg);
      if (klass === segment.SOSSegment) {
        return {offset, segments, apps};
      }
    }
  }
  return {offset, segments, apps};
}

function parseEixf(segments) {
  console.log('Parsing EXIF data');
  if (segments == null) {
    return null;
  }
  const list = segments.map(i => eixf.parse(i)).filter(i => i != null);
  return list[0];
}

export function parse(data) {
  const {offset, segments, apps} = parseHeader(data);
  let end = data.byteLength - 2;
  for (; offset < end; end = end - 1) {
    if (data.getUint16(end) === 0xFFD9) {
      break;
    }
  }
  segments.push(new segment.EOISegment(
      new DataView(data.buffer, data.byteOffset + end, 2)));
  const scanArea =
      new DataView(data.buffer, data.byteOffset + offset, end - offset);
  const exif = parseEixf(apps.get(1));
  if (exif) {
    console.log(exif.debugString());
  }
  return new JPEGFile(segments, scanArea);
};
