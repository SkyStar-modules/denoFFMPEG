import { FfmpegClass, Filters } from "../mod.ts";

const link =
  "https://cdn.discordapp.com/attachments/467182812382887936/800066821713297448/zZpCsH2uswobVSd2L2OplA4ad59L2arVxYtsFpJSEc3hqYB5DeyhfosH8VO4hgOUxi9oJHsRNHFsUQEV98au4w.png";

const overlay: Filters = {
  complex: true,
  filterName: "overlay",
  options: {
    x: "150",
  },
};

Deno.test({
  name: "complex videoFilter feature",
  fn: async () => {
    await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).addInput(link).complexFilters(overlay).save("./tests/videos/output.mp4");
  },
  sanitizeOps: true,
  sanitizeResources: true,
});

Deno.test({
  name: "complex videoFilter feature with progress",
  fn: async () => {
    const thing = await new FfmpegClass({
      ffmpegDir: "ffmpeg",
      input: "./tests/videos/input.mp4",
    }).addInput(link).complexFilters(overlay).save(
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
