import { FfmpegClass } from "../mod.ts";

const link =
  "https://cdn.discordapp.com/attachments/764087395532406824/793974755731963904/crab.mp4";

Deno.test({
  name: "http constructor feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: link,
    }).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "http constructor feature with progress",
  fn: async () => {
    const thing = await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: link,
    }).save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "http inputFile feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput(link).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "http inputFile feature with progress",
  fn: async () => {
    const thing = await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput(link).save("./tests/videos/output.mp4", true);
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
