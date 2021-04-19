import { FfmpegClass } from "../mod.ts";

Deno.test({
  name: "inputFile feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/input.mp4").save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "inputFile feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/input.mp4").saveWithProgress(
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
  name: "double input feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/input.mp4").addInput(
      "./tests/videos/another.mp4",
    ).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "double input feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/input.mp4").addInput(
      "./tests/videos/another.mp4",
    ).saveWithProgress(
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
  name: "input options feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/concat.txt", { f: "concat" }).save(
      "./tests/videos/output.mp4",
    );
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "input options feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/concat.txt", { f: "concat" }).saveWithProgress(
      "./tests/videos/output.mp4",
    );
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
