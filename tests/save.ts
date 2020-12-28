import { FfmpegClass } from "../mod.ts";
Deno.test({
    name: "Test Save feature",
    fn: async() => {
        await new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            source: "./input.mp4"
        }).save("./ree.mp4");
    }
})