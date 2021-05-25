# Deno FFMPEG

## FFmpeg is really nice to use and quite handy for alot of applications But we didn't have any easy wrapper for it in Deno, so now we do :D

## List of features

- Video bitrate(VBR and CBR)
- FFMPEG Filters
- Easy to use
- All methods are chainable
- Frequently updated and maintained by me

---

## V2 information

denoFFMPEG v2 is alot different from v1\
it breaks alot of stuff that used to work.

please read the doc's below to see what changed

## Basic example

`save()` is used to start the render process.

you should always use `save()` or `saveWithProgress()` as last option\
you should always specify the ffmpegDir in the constructor or via the
`setFfmpegPath()` method!

```js
import { ffmpeg } from "./mod.ts";
let videoRender = ffmpeg({ input: "./dev/video0", ffmpegDir: "./dev/ffmpeg" });
await videoRender.videoBitrate(1000).save("./output.mp4");
```

<br>

## How to contribute

Format code with `deno fmt --ignore="tests/videos"`\
Lint with `deno lint --ignore="tests/videos"`\
Run tests with
`deno test --doc src/ffmpegClass.ts && deno test -A --fail-fast tests`

## Authors & Acknowledgments

- Skyler "MierenMans" van Boheemen - Author
