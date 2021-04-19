import { FfmpegClass, Filters } from "../mod.ts";

const sentence = "I love deno :D";

const text: Filters = {
  filterName: "drawtext",
  options: {
    text: sentence,
    fontsize: "60",
    x: (856 / 2 - 30 * sentence.length / 2),
    y: "H-240",
    fontcolor: "white",
    shadowcolor: "black",
    shadowx: "2",
    shadowy: "2",
  },
};

Deno.test({
  name: "simple videoFilter feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoFilters(text).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "simple videoFilter feature with progress",
  fn: async () => {
    const thing = new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).videoFilters(text).saveWithProgress("./tests/videos/output.mp4");
    for await (const progress of thing) {
      console.log(progress.percentage);
    }
  },
  sanitizeOps: true,
  sanitizeResources: true,
});
