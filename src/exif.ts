import {APPSegment} from './segment';
import * as Tiff from './tiff';

const identifier = Array.from('Exif')
                       .map(i => i.charCodeAt(0))
                       .reduce((i, j) => i << 8 | j, 0);
const TIFF_HEADER_STARTING_OFFSET = 12;

export class EXIF {}


function containsExifData(segment: APPSegment) {
  const data = segment.data;
  return segment.type === 1 && segment.size > 8 &&
      data.getUint32(6) === identifier && data.getUint16(10) === 0;
}


export function parse(segment: APPSegment) {
  if (!containsExifData(segment)) {
    return null;
  };
  const data = segment.data;
  const tiff = Tiff.parse(data, TIFF_HEADER_STARTING_OFFSET);
  if (!tiff.isValid()) {
    return null;
  }
}
