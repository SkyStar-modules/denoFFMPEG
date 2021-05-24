import { FfmpegClass } from "../mod.ts";

Deno.test({
  name: "Save feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "SaveWithProgress feature",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
