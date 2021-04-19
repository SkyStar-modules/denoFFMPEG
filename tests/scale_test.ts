import { FfmpegClass } from "../mod.ts";

Deno.test({
  name: "setHeight feature",
  fn: async () => {
    await new FfmpegClass({
      input: "./tests/videos/input.mp4",
    }).setFfmpegPath("ffmpeg").setHeight(710).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "setHeight feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      input: "./tests/videos/input.mp4",
    }).setFfmpegPath("ffmpeg").setHeight(710).saveWithProgress(
      "./tests/videos/output.mp4",
    );
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "setWidth feature",
  fn: async () => {
    await new FfmpegClass({
      input: "./tests/videos/input.mp4",
    }).setFfmpegPath("ffmpeg").setWidth(1280).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "setWidth feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      input: "./tests/videos/input.mp4",
    }).setFfmpegPath("ffmpeg").setWidth(1280).saveWithProgress(
      "./tests/videos/output.mp4",
    );
    for await (const progress of thing) {
      console.log(progress);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "setHeight+setWidth feature",
  fn: async () => {
    await new FfmpegClass({
      input: "./tests/videos/input.mp4",
    }).setFfmpegPath("ffmpeg").setWidth(1280).setHeight(720).save(
      "./tests/videos/output.mp4",
    );
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "setHeight+setWidth feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      input: "./tests/videos/input.mp4",
    }).setFfmpegPath("ffmpeg").setWidth(1280).setHeight(720)
      .saveWithProgress("./tests/videos/output.mp4");
    for await (const progress of thing) {
      console.log(progress);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
