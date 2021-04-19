import { FfmpegClass } from "../mod.ts";

Deno.test({
  name: "output options",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).save("pipe:1", { f: "mpegts" });
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "output options with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).saveWithProgress("pipe:1", { f: "mpegts" });
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
