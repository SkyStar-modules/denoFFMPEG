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
## V2 information
denoFFMPEG v2 is alot different from v1  
it breaks alot of stuff that used to work, please read the doc's below to see what changed
## Basic example
`save()` is used to start the render process. you should always use `save()` or `saveWithProgress()` as last option
```js
import { ffmpeg } from "./mod.ts";
let videoRender = ffmpeg({ input: './dev/video0', ffmpegDir: './dev/ffmpeg' })
await videoRender.videoBitrate(1000).save('./output.mp4');
```
--- 
# Documentation

## Creating a new instance of ffmpeg
The denoFFMPEG module returns a constructor that you can use to instanciate FFmpeg commands.

```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg();

//or use ffmpeg class
import { FfmpegClass } from "./mod.ts";
let render = new FfmpegClass();
```
## save(outputPath: string)
`save()` returns a Promise that get's voided once ffmpeg is done rendering

```js
import { ffmpeg } from "./mod.ts";

await ffmpeg().save('video.mp4');

//or like this
let render = ffmpeg().save('video.mp4');
await render;
```

## saveWithProgress(outputPath: String)
`saveWithProgress()` returns an asyncGenerator with an object with 2 keys in it.  
ETA: which is the estimated time the render is done  
percentage: The percentage of how far the render is  
```js
import { ffmpeg } from "./mod.ts";

let render = ffmpeg().saveWithProgress("video.mp4");

//this will await the yield to be finished
for await (const obj of render) {
    console.log(obj);
}
```
## setFfmpegPath(path: string)
`setFfmpegPath()` will set the ffmpeg path if this is not set in the constructor

```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().setFfmpegPath("./path/to/binary");
await render.save("video.mp4");
```

## addInput(path: string)
`addInput()` will add an input to the list of input's (you need to map them yourself)  
this means that the first input is input 0 so on and so on  
path can be a url aswell

```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().addInput("./path/to/file");
await render.save("video.mp4");
```
```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().addInput("./path/to/file"); // this is input 0
render.addInput("./path/to/file"); // this is input 1
await render.save("video.mp4");
```

## noVideo()
`noVideo()` will just disable video and remove all video settings
```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().noVideo();
await render.save("video.mp4");
```

## noAudio()
`noAudio()` will just disable audio and remove all audio settings
```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().noAudio();
await render.save("video.mp4");
```

## audioCodec(codec: string, options?: Object)
`audioCodec()` let's you specify which audio codec & options to use  
options should only be used if you know what you are doing
```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().audioCodec("lib3lame");
await render.save("video.mp4");
```

## videoCodec(codec: string, options?: Object)
`videoCodec()` let's you specify which video codec & options to use  
options should only be used if you know what you are doing
```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().videoCodec("libx264");
await render.save("video.mp4");
```

## audioBitrate(bitrate: number)
`audioBitrate()` let's you specify the audio bitrate in kbps
```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().audioBitrate(128);
await render.save("video.mp4");
```

## videoBitrate(bitrate: string|number, constantBitrate: boolean)
`videoBitrate()` let's you specify the video bitrate(default is kbps) and if this should be cbr(default) or vbr
```js
import { ffmpeg } from "./mod.ts";
let render = ffmpeg().videoBitrate(1050);
await render.save("video.mp4");
```
```js
import { ffmpeg } from "./mod.ts";

// set the second parameter to false if you want to use VBR
let render = ffmpeg().videoBitrate("1050k", false);
await render.save("video.mp4");
```

## videoFilters(...Filters: Filters[])
`videoFilters()` let's you use the -vf video filters.
```ts
const filters = {
    filterName: "drawtext", //the filtername you want to use
    options: {
        //here you should have all options
    }
}
```
`drawtext="text=cool guy: fontsize: 60"` will be like this
```
{
    filterName: "drawtext",
    options: {
        text: "cool guy",
        fontsize: 60
    }
}
```
```js
import { ffmpeg } from "./mod.ts";

let render = ffmpeg().videoFilters(
    {
    filterName: "drawtext",
    options: {
        text: "cool thing",
        fontsize: "60",
        x: (856 / 2 - 30 * "cool thing".length / 2),
        y: "H-240",
        fontcolor: "white",
        shadowcolor: "black",
        shadowx: "2",
        shadowy: "2",
    }
})
await render.save("video.mp4");
```

---
## Authors or Acknowledgments
- Skyler "MierenMans" van Boheemen - Author
<br>

<h1>License</h1>
Copyright 2021 Skyler "MierenMans" van Boheemen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.