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

Install npm dependencies and start the app.

```
npm install
npm start
```

Connect your camera to your computer via USB and ensure that it stays on as long as you want to take
photos.

## Use

Navigate to localhost:3000 to view a gallery of photos taken by the booth.

Navigate to localhost:3000/control.html to trigger a sequence of photos to be taken.
