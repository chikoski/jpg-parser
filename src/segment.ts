export const identifier = 0xFF;

export class JPEGSegment {
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

export class SOISegment extends JPEGSegment {
  get size() {
    return 0;
  }
  debugString() {
    return `SOI`;
  }
}

export class SOFSegment extends JPEGSegment {
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

export class APPSegment extends JPEGSegment {
  get type() {
    return this.marker & 0x0F;
  }
  debugString() {
    return `APP${this.type} (${this.size}bytes)`;
  }
}

export class EOISegment extends JPEGSegment {
  static marker = 0xD9;
  get size() {
    return 0;
  }
  debugString() {
    return `EOI`;
  }
}

export class SOSSegment extends JPEGSegment {
  debugString() {
    return `SOS`;
  }
}
