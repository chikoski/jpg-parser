class ExifDataType {
  readonly label: string;
  readonly size: number;
  constructor(label, size) {
    this.label = label;
    this.size = size;
  }
}

const typeList = [
  null,
  new ExifDataType("Byte", 1),
  new ExifDataType("ASCII", 1),
  new ExifDataType("Short", 2),
  new ExifDataType("Long", 4),
  new ExifDataType("Ratinoal", 8),
  new ExifDataType("Undefined", 1),
  new ExifDataType("SShort", 2),
  new ExifDataType("SLong", 4),
  new ExifDataType("SRatinoal", 8),
  new ExifDataType("Float", 4),
  new ExifDataType("Double", 8),
];

class IR {
  readonly id: number;
  readonly type: ExifDataType;
  readonly count: number;
  constructor(id, type, count) {
    this.id = id;
    this.type = typeList[type];
    this.count = count;
  }
  get size() {
    return this.count * this.type.size;
  }
  get isPointer() {
    return this.size <= 4;
  }
  isValid() {
    return this.type != null;
  }
}
class Ratinoal {
  readonly numerator: number;
  readonly denominator: number;
  constructor(numerator, denominator) {
    this.numerator = numerator;
    this.denominator = denominator;
  }
}

class TagIdDescription {
  readonly id: number;
  readonly label: string;
  readonly description: string;
  constructor(id, label, description) {
    this.id = id;
    this.label = label;
    this.description = description;
  }
}
const IdDescriptionList = [
  new TagIdDescription(271, "Make", "画像入力機器のメーカー名"),
  new TagIdDescription(272, "Model", "画像入力機器のモデル名"),
  new TagIdDescription(273, "StripOffsets", "画像データのオフセット"),
  new TagIdDescription(274, "Orientation", "画像方向"),
  new TagIdDescription(305, "CreatorTool", "使用ソフトウェア名"),
  new TagIdDescription(34665, "ExifIFDPointer", "Exif sub IFDへのポインタ"),
  new TagIdDescription(34853, "GPSInfoIFDPointer", "GPS情報IFDへのポインタ"),
];

const IdDescriptionMap = new Map(IdDescriptionList.map(i => [i.id, i]));

export class Tag {
  readonly id: number;
  readonly type: ExifDataType;
  readonly values: Array<number | Ratinoal>;
  constructor(ir, values) {
    this.id = ir.id;
    this.type = ir.type;
    this.values = values;
  }
  debugStrng() {
    const description = IdDescriptionMap.get(this.id);
    const id = description ? description.label : this.id;
    console.log(description);
    return `TAG (${id}: ${this.type.label})`;
  }
}

export function parse(data, offset, endian) {
  const id = data.getUint16(offset, endian);
  const type = data.getUint16(offset + 2, endian);
  const count = data.getUint32(offset + 4, endian);
  const ptrOrValue = data.getUint32(offset + 8, endian);
  const ir = new IR(id, type, count);
  if (!ir.isValid()) {
    return null;
  }
  const values = [];
  return new Tag(ir, values);
}

export const size = 12;