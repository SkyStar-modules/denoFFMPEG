import { FfmpegClass } from "../mod.ts";

const options = {
  preset: "fast",
  tune: "zerolatency",
};

Deno.test({
  name: "videoCodec feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoCodec("libx264", options).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "videoCodec feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoCodec("libx264", options).save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
