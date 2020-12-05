# Deno FFMPEG
### FFmpeg is really nice to use and quite handy for alot of applications.
### But we didn't have any easy wrapper for it in Deno!<br>So now we do :D
---
## List of features

- Video bitrate(VBR and CBR)
- FFMPEG Filters
- Easy to use
- All methods are chainable
- Frequently updated and maintained by me

---

## Basic example
`save()` is used to start the render process. you should always use `save()` as last option
```js
import { ffmpeg } from "./mod.ts";
let videoRender = new ffmpeg('./dev/video0', { ffmpegDir: './dev/ffmpeg' })
videoRender.videoBitrate(1000).save('./output.mp4');
```
--- 
# Documentation

## Creating a new instance of ffmpeg
The denoFFMPEG module returns a constructor that you can use to instanciate FFmpeg commands.

```js
import { ffmpeg } from "./mod.ts";
var render = new ffmpeg();
```

You may pass a single input file and configuration object to the constructor.
```js
import { ffmpeg } from "./mod.ts";
new ffmpeg('./path/to/video0', { ffmpegDir: './path/to/ffmpeg'})
```

```js
import { ffmpeg } from "./mod.ts";
new ffmpeg({ ffmpegDir: './path/to/ffmpeg'})
    .input('./path/to/video0')
```

~~the options are the following:~~
* ~~`source`: ffmpeg input source~~
* ~~`timeout`: ffmpeg timeout in seconds (defaults to no timeout)~~
* ~~`niceness`: ffmpeg niceness value, between -20 and 20; ignored on Windows platforms (defaults to 0)~~
* ~~`logger`: logger string with `debug`, `info`, `warning`, `error`, `fatal`, `verbose` and `quiet` methods (defaults to quiet)~~  

This functionality will be added in v1.2
### Specifying inputs

You can only use one input for Ffmpeg. More support will be added in v1.2  
An input can be:
* a file name (eg. `./path/to/file.avi`);
* an image pattern (eg. `./path/to/frame%03d.png`);

```js
// Note that all denoFFMPEG methods are chainable
// currently the last input path will be used
new ffmpeg()
  .input('./path/to/input1.avi')

// Passing an input to the constructor is the same as calling .input()
new ffmpeg('./path/to/input1.avi') // <= this one will be ignored
  .input('./path/to/input2.avi')   // <= this one will also be ignored
  .input('./path/to/input3.avi');
```
This functionality will be added in v1.2
## Audio options

The following methods change the audio stream(s) in the produced output.

### noAudio(): disable audio altogether

Disables audio in the output and remove any previously set audio option.

```js
new ffmpeg('./path/to/file.avi').noAudio();
```

### audioCodec(codec): set audio codec

```js
new ffmpeg('./path/to/file.avi').audioCodec('libmp3lame');
```

~~denoFFMPEG checks for codec availability before actually running the command, and throws an error when a specified audio codec is not available.~~  
^^ This will be added in v1.2

### audioBitrate(bitrate): set audio bitrate

Sets the audio bitrate in kbps. The `bitrate` parameter may be a number or a string with an optional `k` suffix.  
This method is used to enforce a constant bitrate;~~use `audioQuality()` to encode using a variable bitrate~~  
`audioQuality()` method will be added in v1.2

```js
new ffmpeg('./path/to/file.avi').audioBitrate(128);
new ffmpeg('./path/to/file.avi').audioBitrate('128');
new ffmpeg('./path/to/file.avi').audioBitrate('128k');
```
 ---
## Video options

The following methods change the video stream(s) in the produced output.

### noVideo(): disable video altogether

This method disables video output and removes any previously set video option.

```js
new ffmpeg('./path/to/file.avi').noVideo();
```

### videoCodec('codec'): set video codec

```js
new ffmpeg('./path/to/file.avi').videoCodec('libx264');
```

~~denoFFMPEG checks for codec availability before actually running the command, and throws an error when a specified video codec is not available.~~  
^^ This will be added in v1.2

### videoBitrate(bitrate[, constant=true]): set video bitrate

Sets the target video bitrate in kbps.  The `bitrate` argument may be a number or a string with an optional `k` or `m` suffix.  The `constant` argument specifies whether a constant bitrate should be enforced (defaults to false).

Keep in mind that, depending on the codec used, enforcing a constant bitrate often comes at the cost of quality.  The best way to have a constant video bitrate without losing too much quality is to use 2-pass encoding (not supported yet).

```js
new ffmpeg('./path/to/file.avi').videoBitrate(1000);
new ffmpeg('./path/to/file.avi').videoBitrate('1000');
new ffmpeg('./path/to/file.avi').videoBitrate('1000k');
new ffmpeg('./path/to/file.avi').videoBitrate('1000k', false);
```

### videoFilters(filter...): add custom video filters

This method enables adding custom video filters.  You may add multiple filters at once by passing either several arguments or an array.  See the Ffmpeg documentation for available filters and their syntax.

Each filter pased to this method can only be a filter specification object with the following keys:
* `filterName`: filter name
* `options`: optional; use object mapping option names to values (eg. `{ t: 'in', s: 0, n: 30 }`).  When `options` is not specified, the filter will be added without any options.

```js
new ffmpeg().videoFilters(
  {
    filterName: "drawtext",
    options: {
        fontfile: "/path/to/fontfile.ttf",
        fontcolor: "white",
        fontsize: 12,
        x: 12,
        y: 12,
        shadowcolor: "black",
        shadowx: 12,
        shadowy: 12,
        text: "sum text"
    }
  }
)
```

### save('path'): path to output file
path to your output file. eg `./output.mp4` or `C:/full/path/to/output.mp4`  
Save should always be specified to run ffmpeg

```js
new ffmpeg().save('./path/to/output.mp4');
```
## Misc options

### on('event', func): event listener
listen to one of the events and do something with it
`end`, `error` and `progress`
the first two indicate that ffmpeg has stopped.  
Either by being finished or because ffmpeg/denoFFMPEG threw an error

```js
new ffmpeg().on('error', errorSTRING => {
  console.log(error);
}).save('./savefile.mp4');


new ffmpeg().on('end', statusOBJ => {
  console.log(JSON.Stringify(statusOBJ));
}).save('./savefile.mp4');
// Object values for
// statusOBJ {
//   success: boolean;
//   code: number
// }

new ffmpeg().on('progress', progressOBJ => {
  console.log(JSON.Stringify(progressOBJ));
}).save('./savefile.mp4');
// Object values for 
// progressOBJ {
//   ETA: Date;
//   percentage: number 
// }
```
### off('event', func): same as on('event', func) but just once
listen to one of the events and fire once
`end`, `error` and `progress`
the first two indicate that ffmpeg has stopped.  
Either by being finished or because ffmpeg/denoFFMPEG threw an error

```js
new ffmpeg().on('error', errorSTRING => {
  console.log(error);
}).save('./savefile.mp4');


new ffmpeg().on('end', statusOBJ => {
  console.log(JSON.Stringify(statusOBJ));
}).save('./savefile.mp4');
// Object values for
// statusOBJ {
//   success: boolean;
//   code: number
// }

new ffmpeg().on('progress', progressOBJ => {
  console.log(JSON.Stringify(progressOBJ));
}).save('./savefile.mp4');
// Object values for 
// progressOBJ {
//   ETA: Date;
//   percentage: number 
// }
```
---
## Changelog
## 1.1
- added noAudio() method
- added noVideo() method
- added 'progress' eventEmitter
- added audiobitrate() method
- rewrote videoFilters() method for better filtering
<br><br>
- changed addFilters() => videoFilters()
- changed ffmpegWrapper.ts => mod.ts
- changed [std@0.79.0/node/events.ts](https://deno.land/std@0.79.0/node/events.ts) => [event@0.2.0](https://deno.land/x/event@0.2.0)
- merged interfaces.ts & mod.ts
<br><br>
- fucked up a bunch
- removed deprecated code
- updated external libs
<br><br>
## 1.0
-  Added buggy ffmpeg wrapper
---
## Authors or Acknowledgments
- Christiaan "MierenMans" van Boheemen - Author
- [crowlKats](https://github.com/crowlKats) - Made [event@0.2.0](https://deno.land/x/event@0.2.0) chainable for me :)
- Robin "Dubbel" Noort - Wrapper Idea
<br>

<h1>License</h1>
Copyright 2020 Christiaan "MierenMans" van Boheemen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.