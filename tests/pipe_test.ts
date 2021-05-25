import { FfmpegClass } from "../mod.ts";
const data = await Deno.readFile("./tests/videos/input.webm");

Deno.test({
  name: "input pipe feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
    }).addInput(data).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "output pipe feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).save("pipe:1", false, { f: "mpegts" });
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
