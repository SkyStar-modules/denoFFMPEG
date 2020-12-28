import { FfmpegClass } from "../mod.ts";
Deno.test({
    name: "Test SaveWithProgress feature",
    fn: async() => {
        const thing = await new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            source: "./input.mp4"
        }).saveWithProgress("../ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    return;
    }
})