import { FfmpegClass } from "../mod.ts";
Deno.test({
  name: "videoBitrate(1300, true) feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoBitrate(1300, true).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "videoBitrate(1300, false) feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoBitrate(1300, false).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "videoBitrate(1300) feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoBitrate(1300, true).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "videoBitrate(1300, true) feature with progress",
  fn: async () => {
    const progress = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoBitrate(1300, true).saveWithProgress("./tests/videos/output.mp4");
    for await (const obj of progress) {
      console.log(obj);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "videoBitrate(1300, false) feature with progress",
  fn: async () => {
    const progress = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoBitrate(1300, false).saveWithProgress("./tests/videos/output.mp4");
    for await (const obj of progress) {
      console.log(obj);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "videoBitrate(1300) feature with progress",
  fn: async () => {
    const progress = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoBitrate(1300, true).saveWithProgress("./tests/videos/output.mp4");
    for await (const obj of progress) {
      console.log(obj);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
