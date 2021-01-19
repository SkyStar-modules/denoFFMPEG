import { FfmpegClass } from "../mod.ts";
Deno.test({
    name: "setHeight feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            input: "./input.mp4"
        }).setFfmpegPath("./ffmpeg/ffmpeg.exe").setHeight(710).saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "setHeight feature",
    fn: async() => {
        await new FfmpegClass({
            input: "./input.mp4"
        }).setFfmpegPath("./ffmpeg/ffmpeg.exe").setHeight(710).save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "setWidth feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            input: "./input.mp4"
        }).setFfmpegPath("./ffmpeg/ffmpeg.exe").setWidth(1280).saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "setWidth feature",
    fn: async() => {
        await new FfmpegClass({
            input: "./input.mp4"
        }).setFfmpegPath("./ffmpeg/ffmpeg.exe").setWidth(1280).save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "setHeight+setWidth feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            input: "./input.mp4"
        }).setFfmpegPath("./ffmpeg/ffmpeg.exe").setWidth(1280).setHeight(720).saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "setHeight+setWidth feature",
    fn: async() => {
        await new FfmpegClass({
            input: "./input.mp4"
        }).setFfmpegPath("./ffmpeg/ffmpeg.exe").setWidth(1280).setHeight(720).save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})