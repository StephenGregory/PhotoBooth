const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const async = require('async');
const util = require('util');
const glob = require('glob');
const moment = require('moment');

function Capture(keepImagesOnCamera, tempDir) {
    this.keepImagesOnCamera = keepImagesOnCamera;
    this.tempDir = tempDir;
}

Capture.prototype.capture = function (numberOfPhotos, delay, callback) {
    const _this = this;
    child_process.exec('gphoto2 --auto-detect', (error, stdOut, stdErr) => {
        if (error) {
            return callback(error);
        }

        const lines = stdOut.split(os.EOL);
        if (lines.length === 2 || lines[2].trim() === "") {
            return callback(new Error("Camera not detected."));
        }

        const timestamp = moment().format('YYYYMMDDHHmmss')
        const filename = path.join(_this.tempDir, util.format('booth_%s_%n.jpg', timestamp));

        const takePhotoCommand = util.format('gphoto2 --keep-raw --force-overwrite --capture-image-and-download %s --frames=%d --interval=%d --filename=%s',
            this.keepImagesOnCamera ? '--keep' : '--no-keep', numberOfPhotos, delay - 1, filename);

        child_process.exec(takePhotoCommand, { cwd: _this.tempDir }, (error, standardOut, standardError) => {
            glob(util.format('booth_%s_*.jpg', timestamp), { cwd: _this.tempDir, absolute: true, stat: true }, (err, files) => {
                if (err) {
                    return callback(err);
                }
                else {
                    return callback(null, files);
                }
            });
        });
    });
}

module.exports = Capture;
