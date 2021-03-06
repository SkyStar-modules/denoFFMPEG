import { FfmpegClass } from "../mod.ts";

Deno.test({
  name: "empty constructor feature",
  fn: async () => {
    await new FfmpegClass().addInput("./tests/videos/input.mp4").setFfmpegPath(
      "ffmpeg",
    ).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "empty constructor feature with progress",
  fn: async () => {
    const thing = await new FfmpegClass().addInput("./tests/videos/input.mp4")
      .setFfmpegPath(
        "ffmpeg",
      ).save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
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
      input: "./tests/videos/input.mp4",
    }).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "full constructor feature with progress",
  fn: async () => {
    const thing = await new FfmpegClass({
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
