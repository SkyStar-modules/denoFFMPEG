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
    const thing = await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/input.mp4").save(
      "./tests/videos/output.mp4",
      true,
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
    const thing = await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/input.mp4").addInput(
      "./tests/videos/another.mp4",
    ).save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "input options concat feature",
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
  name: "input options concat feature with progress",
  fn: async () => {
    const thing = await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput("./tests/videos/concat.txt", { f: "concat" }).save(
      "./tests/videos/output.mp4",
      true,
    );
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
