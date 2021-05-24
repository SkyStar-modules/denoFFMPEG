import { FfmpegClass } from "../mod.ts";

Deno.test({
  name: "setFfmpegPath feature",
  fn: async () => {
    await new FfmpegClass({
      input: "./tests/videos/input.mp4",
    }).setFfmpegPath("ffmpeg").save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "setFfmpegPath feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      input: "./tests/videos/input.mp4",
    }).setFfmpegPath("ffmpeg").save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
