const LITTLE_ENDIAN = 0x4949;
const MAGIC = 0x002A;

class Header {
  readonly endian: Boolean;
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

class Tag {
  debugStrng() {
    return `TAG`;
  }
}

class IFD {
  readonly tags: Array<Tag>;
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
    return `IFD (${tags.length} tags inside)\n${tags}`;
  }
}

function parseTag(data, offset, endian) {
  return new Tag();
}

function parseIFD(data, offset, endian = false) {
  const numberOfTags = data.getUint16(offset, endian);
  const tags = [];
  for (let i = 0; i < numberOfTags; i = i + 12) {
    const tag = parseTag(data, offset + i, endian);
    tags.push(tag);
  }
  const nextIFD = data.getUint32(offset + 12 * numberOfTags);
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
  const primaryIFD = parseIFD(data, offset + header.nextIFD);
  return new Tiff(header, [primaryIFD]);
}
