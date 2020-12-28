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
import ffmpeg from "./mod.ts";
let videoRender = ffmpeg({ source: './dev/video0', ffmpegDir: './dev/ffmpeg' })
videoRender.videoBitrate(1000).save('./output.mp4');
```
--- 
# Documentation

## Creating a new instance of ffmpeg
The denoFFMPEG module returns a constructor that you can use to instanciate FFmpeg commands.

```js
import ffmpeg from "./mod.ts";
let render = ffmpeg();

//or use ffmpeg class
import { FfmpegClass } from "./mod.ts";
let render = new FfmpegClass();
```

---

## Changelog
## 1.2
- *added* pipe method
- *added* 'data' eventEmitter for pipe method
- *added* fatalError in constructor object
- *added* ffmpeg function as default export. Use `import namehere from "./mod.ts"` for the function and `import {FfmpegClass} from "./mod.ts"`
- *rewrote* constructor into one parameter with an object for everything. Check docs
<br><br>
- *changed* constructer. Now it is one object like with the following options `ffmpegDir`, `niceness`(not used on windows), `fatalError`(on by default) and `source` which is the inputfile  
You don't need to specify all these, but you can
## 1.1.1
- *added* url input's
<br><br>
- *changed* variable **sumshit** => to **progressOBJ**
## 1.1
- *added* noAudio() method
- *added* noVideo() method
- *added* 'progress' eventEmitter
- *added* audiobitrate() method
- *rewrote* videoFilters() method for better filtering
<br><br>
- *changed* addFilters() => videoFilters()
- *changed* ffmpegWrapper.ts => mod.ts
- *changed* [std@0.79.0/node/events.ts](https://deno.land/std@0.79.0/node/events.ts) => [event@0.2.0](https://deno.land/x/event@0.2.0)
- *merged* interfaces.ts & mod.ts
<br><br>
- *fucked* up a bunch
- *removed* deprecated code
- *updated* external libs
<br><br>
## 1.0
-  Added buggy ffmpeg wrapper
---
## Authors or Acknowledgments
- Christiaan "MierenMans" van Boheemen - Author
- [crowlKats](https://github.com/crowlKats) - Made [event@0.2.0](https://deno.land/x/event@0.2.0) chainable for me :)
<br>

<h1>License</h1>
Copyright 2020 Christiaan "MierenMans" van Boheemen

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.