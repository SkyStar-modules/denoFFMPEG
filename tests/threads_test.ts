import { FfmpegClass } from "../mod.ts";

Deno.test({
  name: "threads feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).threads(8).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "threads feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).threads(8).save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "threads constructor feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
      threads: 8,
    }).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "threads constructor feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
      threads: 8,
    }).save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
