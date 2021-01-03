import { FfmpegClass } from "../mod.ts";
Deno.test({
    name: "inputFile feature",
    fn: async() => {
        await new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe"
        }).inputFile("./input.mp4").save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "inputFile feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe"
        }).inputFile("./input.mp4").saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "double input feature",
    fn: async() => {
        await new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe"
        }).inputFile("./input.mp4").inputFile("./ree.mp4").save("./another.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "double input feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe"
        }).inputFile("./input.mp4").inputFile("./ree.mp4").saveWithProgress("./another.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})