import { FfmpegClass } from "../mod.ts";
Deno.test({
    name: "Save feature",
    fn: async() => {
        await new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            source: "./input.mp4"
        }).save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})