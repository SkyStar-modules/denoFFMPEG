import { FfmpegClass } from "../mod.ts";
Deno.test({
  name: "setFfmpegPath feature",
  fn: async () => {
    await new FfmpegClass({
      input: "./input.mp4",
    }).setFfmpegPath("./ffmpeg/ffmpeg.exe").save("./ree.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
Deno.test({
  name: "setFfmpegPath feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      input: "./input.mp4",
    }).setFfmpegPath("./ffmpeg/ffmpeg.exe").saveWithProgress("./ree.mp4");
    for await (const progress of thing) {
      console.log(progress);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
