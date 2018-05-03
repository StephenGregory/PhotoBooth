const express = require('express');
const async = require('async');
const http = require('http');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');
const winston = require('winston');
const request = require('request');
const yaml = require('js-yaml');
var expressHandlebars = require('express-handlebars');

const Capture = require('./lib/capture');
const ImageProcessor = require('./lib/image-modifier');

winston.configure({
    level: 'debug',
    transports: [
        new winston.transports.Console({ timestamp: true })
    ]
});

let customConfig = {};

try {
    if (fs.existsSync('./config.yaml')) {
        customConfig = yaml.safeLoad(fs.readFileSync('./config.yaml'));
    }
}
catch (err) {
    winston.error('Could not read configuration', err);
    process.exit(1);
}

const defaultConfig = {
    server: {
        port: 3000
    },
    camera: {
        numberOfPhotos: 3,
        delay: 3,
        keepPhotosOnCamera: true
    },
    processing: {
        width: 1280,
        height: 800
    },
    app: {
        title: 'My Photo Reel'
    }
}

var config = {};
Object.assign(config, defaultConfig, customConfig);

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const port = config.server.port;

app.engine('handlebars', expressHandlebars({}));
app.set('view engine', 'handlebars');
app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index', { title: config.app.title });
});

app.get('/control', function (req, res) {
    res.render('control');
});

wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
};

const capture = new Capture(config.camera.keepPhotosOnCamera, '/tmp/');
let options = {
    width: config.processing.width || 1020
};
const processor = new ImageProcessor(options);

wss.on('connection', (ws, req) => {
    winston.info('Client connected to socket');

    ws.on('message', (message) => {

        winston.info('Client sent ', message);
        var parsedMsg = JSON.parse(message);

        switch (parsedMsg.type) {
            case 'trigger-capture': {
                winston.info('Triggering capture');
                capture.capture(config.camera.numberOfPhotos, config.camera.delay, (err, paths) => {
                    if (err) {
                        winston.error('Could not capture images', err);
                        return;
                    }
                    winston.debug('Images captured to', paths);
                    async.mapSeries(paths,
                        function (originalImagePath, callback) {
                            const destination = path.join(__dirname, 'public/images', path.basename(originalImagePath));
                            processor.shrink(originalImagePath, destination, callback);
                        },
                        function (err, newPaths) {
                            if (err) {
                                winston.error('Unable to resize images', err);
                                return;
                            }
                            winston.debug('Images resized', newPaths);
                            const relativePaths = newPaths.map(p => path.relative(path.join(__dirname, 'public'), p));

                            wss.broadcast(JSON.stringify({ type: 'new-images', data: relativePaths }));
                            wss.broadcast(JSON.stringify({ type: 'captured-images', data: relativePaths }));
                        });
                });
                break;
            }
            case 'get-all-images': {
                fs.readdir(path.join(__dirname, 'public/images'), (err, files) => {
                    let images = files.map(f => path.join('images', f));
                    ws.send(JSON.stringify({ type: 'new-images', data: images }));
                })
                break;
            }
            default: break;
        }
    });

    ws.send(JSON.stringify({ type: 'text', data: 'message from server' }));
});

server.listen(port, () => {
    winston.info('Listening on %d', server.address().port);
});
