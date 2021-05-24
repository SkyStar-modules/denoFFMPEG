import { FfmpegClass } from "../mod.ts";

const options = {
  qscale: "6",
};

Deno.test({
  name: "audioCodec feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).audioCodec("libmp3lame", options).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "audioCodec feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).audioCodec("libmp3lame", options).save(
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
