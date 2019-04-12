const fs = require('fs').promises;
const path = require('path');
import * as jpg from '../src/index';

function showError(error) {
  console.error(error + '');
}

function parse(data: DataView) {
  console.log(`Start parsing a jpg file(${data.byteLength} bytes)`);
  const file = jpg.parse(data);
  console.log(file.debugString());
}

function main(args) {
  const file = args.length > 2 ? args[2] : './etc/photo.jpg';
  fs.readFile(path.resolve(process.cwd(), file))
      .then(res => {
        const buffer = res.buffer;
        const data = new DataView(buffer, buffer.byteOffset, buffer.byteLength)
        return parse(data);
      })
      .catch(showError);
}

main(process.argv);
