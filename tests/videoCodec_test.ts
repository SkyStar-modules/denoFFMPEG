import { FfmpegClass } from "../mod.ts";
Deno.test({
    name: "videoCodec feature",
    fn: async() => {
        await new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            source: "./input.mp4"
        }).videoCodec("libx264").save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "videoCodec feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            source: "./input.mp4"
        }).videoCodec("libx264").saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})