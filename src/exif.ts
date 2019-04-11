import { APPSegment } from "./segment";

const identifier = Array.from("Exif").map(i => i.charCodeAt(0)).reduce((i, j) => i << 8 | j, 0);

export function parse(segment: APPSegment) {
  const data = segment.data;
  const header = parseHeader(data);
  const eixfIFD = parseIFD(data, header.size);
  const gpsIFD = parseIFD(data, eixfIFD.nextIFDPointer);
  const compatibilityIFD = parseIFD(data, gpsIFD.nextIFDPointer);
  const firstIFD = parseIFD(data, compatibilityIFD.nextIFDPointer);
  const thumbnail = new DataView(data.buffer, firstIFD.nextIFDPointer);
}