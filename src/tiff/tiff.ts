import * as Tag from "./tag";

const LITTLE_ENDIAN = 0x4949;
const MAGIC = 0x002A;

class Header {
  readonly endian: boolean;
  readonly magic: number;
  readonly nextIFD: number;

  constructor(endian, magic, nextIFD) {
    this.endian = endian;
    this.magic = magic;
    this.nextIFD = nextIFD;
  }

  isValid() {
    return this.magic === MAGIC && this.nextIFD > 0;
  }

  debugString() {
    return `TIFF(${this.endian ? 'Little' : 'Big'} endian)`;
  }
}

class Tiff {
  readonly header: Header;
  readonly ifdList: Array<IFD>;
  constructor(header, ifdList) {
    this.header = header;
    this.ifdList = ifdList;
  }
  isValid() {
    return this.header.isValid();
  }
  debugString() {
    const header = this.header.debugString();
    const ifd = this.ifdList.map(i => i.debugString()).join('\n');
    return `${header}\n${ifd}`;
  }
}

class IFD {
  readonly tags: Array<Tag.Tag>;
  readonly nextIFD: number;
  constructor(tags, nextIFD) {
    this.tags = tags;
    this.nextIFD = nextIFD;
  }
  debugString() {
    const tags = this.tags
      .map((tag, index) => {
        return `#${index}: ${tag.debugStrng()}`;
      })
      .join('\n');
    return `IFD (${this.tags.length} tags inside)\n${tags}`;
  }
}


function parseIFD(data, offset, endian = false) {
  const numberOfTags = data.getUint16(offset, endian);
  const tags = [];

  for (let i = 0; i < numberOfTags; i = i + 1) {
    const t = Tag.parse(data, offset + 2 + i * Tag.size, endian);
    tags.push(t);
  }
  const nextIFD = data.getUint32(offset + 2 + Tag.size * numberOfTags);
  return new IFD(tags, nextIFD);
}

function parseHeader(data, offset = 0) {
  const endian = (data.getUint16(offset) === LITTLE_ENDIAN);
  const magic = data.getUint16(offset + 2, endian);
  const nextIFD = data.getUint32(offset + 4, endian);
  return new Header(endian, magic, nextIFD);
}

export function parse(data, offset = 0) {
  const header = parseHeader(data, offset);
  const ifdlist = [];
  for (let start = header.nextIFD + offset; start < data.byteLength;) {
    const ifd = parseIFD(data, start, header.endian);
    ifdlist.push(ifd);
    start = ifd.nextIFD + offset;
    console.log(`${start < data.byteLength}`);
  }
  return new Tiff(header, ifdlist);
}