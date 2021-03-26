import { FfmpegClass } from "../mod.ts";
Deno.test({
  name: "empty constructor feature",
  fn: async () => {
    await new FfmpegClass().addInput("./input.mp4").setFfmpegPath(
      "ffmpeg",
    ).save("./ree.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "empty constructor feature with progress",
  fn: async () => {
    const thing = new FfmpegClass().addInput("./input.mp4").setFfmpegPath(
      "ffmpeg",
    ).saveWithProgress("./ree.mp4");
    for await (const progress of thing) {
      console.log(progress);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "full constructor feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./input.mp4",
      niceness: 20,
    }).save("./ree.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "full constructor feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./input.mp4",
      niceness: 20,
    }).saveWithProgress("./ree.mp4");
    for await (const progress of thing) {
      console.log(progress);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
