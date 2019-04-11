import { APPSegment } from "./segment";

const identifier = Array.from("Exif").map(i => i.charCodeAt(0)).reduce((i, j) => i << 8 | j, 0);

export class EXIF {
  constructor(segment: APPSegment) {

  }
}