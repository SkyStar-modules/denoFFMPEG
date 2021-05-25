# Deno FFMPEG

## FFmpeg is really nice to use and quite handy for alot of applications But we didn't have any easy wrapper for it in Deno, so now we do :D

## List of features

- Video bitrate(VBR and CBR)
- FFMPEG Filters
- Easy to use
- All methods are chainable
- Frequently updated and maintained by me

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

Format code with `deno fmt`\
Lint with `deno lint`\
Run tests with
`deno test --doc src/ffmpegClass.ts && deno test -A --fail-fast tests`

## Authors & Acknowledgments

- Skyler "MierenMans" van Boheemen - Author
