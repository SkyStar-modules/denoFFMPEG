import { FfmpegClass, Filters } from "../mod.ts";
const sentence = "I love deno :D"
const link = "https://cdn.discordapp.com/attachments/467182812382887936/800066821713297448/zZpCsH2uswobVSd2L2OplA4ad59L2arVxYtsFpJSEc3hqYB5DeyhfosH8VO4hgOUxi9oJHsRNHFsUQEV98au4w.png";
const text:Filters = {
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
    }
}
const overlay:Filters = {
    complex: true,
    filterName: "overlay",
    options: {
        x: '150'
    }
}
Deno.test({
    name: "simple videoFilter feature",
    fn: async() => {
        await new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            input: "./input.mp4"
        }).videoFilters(text).save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "simple videoFilter feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            input: "./input.mp4"
        }).videoFilters(text).saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})

Deno.test({
    name: "complex videoFilter feature",
    fn: async() => {
        await new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            input: "./input.mp4"
        }).addInput(link).videoFilters(overlay).save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "complex videoFilter feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            ffmpegDir: "./ffmpeg/ffmpeg.exe",
            input: "./input.mp4"
        }).addInput(link).videoFilters(overlay).saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})