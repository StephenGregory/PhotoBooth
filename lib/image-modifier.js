const sharp = require('sharp');
const fs = require('fs');

let ImageProcessor = function (options) {
    this.width = options.width;
    this.height = options.height;
};

ImageProcessor.prototype.shrink = function (path, destination, callback) {
    sharp(path).resize(this.width, this.height)
        .toFile(destination)
        .then(() => callback(null, destination), (err) => callback(err));
};

module.exports = ImageProcessor;
