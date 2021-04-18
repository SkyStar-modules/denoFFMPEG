import { FfmpegClass } from "../mod.ts";
Deno.test({
  name: "outputformat feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).outputFormat("mpegts").save("pipe:1");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "outputformat feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).outputFormat("mpegts").saveWithProgress("pipe:1");
    for await (const progress of thing) {
      console.log(progress);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
