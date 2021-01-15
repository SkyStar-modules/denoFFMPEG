import { FfmpegClass } from "../mod.ts";
Deno.test({
    name: "SaveWithProgress feature",
    fn: async() => {
        const thing = new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            input: "./input.mp4"
        }).saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})