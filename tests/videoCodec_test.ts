import { FfmpegClass } from "../mod.ts";
const options = {
  preset: "fast",
  tune: "zerolatency",
};
Deno.test({
  name: "videoCodec feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "./ffmpeg/ffmpeg.exe",
      input: "./input.mp4",
    }).videoCodec("libx264", options).save("./ree.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "videoCodec feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "./ffmpeg/ffmpeg.exe",
      input: "./input.mp4",
    }).videoCodec("libx264", options).saveWithProgress("./ree.mp4");
    for await (const progress of thing) {
      console.log(progress);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
