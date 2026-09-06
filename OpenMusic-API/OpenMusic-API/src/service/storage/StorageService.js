const fs = require('fs');
const path = require('path');

class StorageService {
  constructor(folder) {
    this._folder = folder;

    const imagesFolder = path.resolve(folder, 'images');
    if (!fs.existsSync(imagesFolder)) {
      fs.mkdirSync(imagesFolder, { recursive: true });
    }
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const filePath = path.resolve(this._folder, 'images', filename);

    const fileStream = fs.createWriteStream(filePath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => {
        fs.unlink(filePath, () => reject(error));
      });
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }
}

module.exports = StorageService;