Photobooth
----------

A photobooth web app. Designed with Raspberry Pi B+ in mind.

Connect your camera to a computer running the app and have the app trigger photos to be taken and
displayed neatly in a gallery.

## Prerequisites

- Unix OS
- [gphoto2](http://www.gphoto.org/doc/manual/ref-gphoto2-cli.html)
- A camera supported by gphoto2

## Setup

Install npm dependencies.

```
npm install
```

To change the configuration options, copy config.dist.yaml to config.yaml and adjust any of the values. All options are optional. The defaults are below:

```
server:
    port: 3000
camera:
    numberOfPhotos: 3
    delay: 3
    keepPhotosOnCamera: true
processing:
    width: 1020
    height: 800
```

Start the app:

```
npm start
```

Connect your camera to your computer via USB and ensure that it stays on as long as you want to take
photos.

## Use

Navigate to localhost:3000 to view a gallery of photos taken by the booth.

Navigate to localhost:3000/control.html to trigger a sequence of photos to be taken.
