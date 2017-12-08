const request = require('request');
const fs = require('fs');
const url = require('url');
const path = require('path');
const async = require('async');
const moment = require('moment');


function CaptureStub() {
    this.after = null;
}

CaptureStub.prototype.capture = function (numberOfPhotos, delay, cb) {
    //options.numberPhotos
    //options.delay

    const _this = this;
    const redditUrl = 'https://www.reddit.com/r/wallpaper/new.json?limit=' + numberOfPhotos + '&after=' + _this.after;
    request(redditUrl, { json: true }, (err, res, body) => {
        if (err) {
            return cb(err);
        }

        _this.after = body.data.after;

        const urls = body.data.children.map(child => child.data.url).filter(url => url.endsWith('.jpg'));

        let paths = [];
        async.map(urls,
            (urlPath, callback) => {
                const parsed = url.parse(urlPath);
                const filename = path.basename(parsed.pathname);
                const ext = path.extname(parsed.pathname);
                const imgName = filename.substr(0, filename.length - filename.indexOf(ext));
                const fullPath = path.join('/tmp/', 'reddit_' + moment().format('YYYYMMDDHHmmss') + imgName + ext);
                request(urlPath)
                    .pipe(fs.createWriteStream(fullPath))
                    .on('error', err => callback(err))
                    .on('finish', () => callback(null, fullPath));
            },
            function (err, paths) {
                if (err) {
                    return cb(err);
                }
                return cb(null, paths)
            });
    });
}

module.exports = CaptureStub;
