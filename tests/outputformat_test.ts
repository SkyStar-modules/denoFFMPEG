import { FfmpegClass } from "../mod.ts";

Deno.test({
  name: "output options",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).save("pipe:1", false, { f: "mpegts" });
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
