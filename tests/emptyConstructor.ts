import { FfmpegClass } from "../mod.ts";
Deno.test({
    name: " feature",
    fn: async() => {
        await new FfmpegClass().inputFile("./input.mp4").setFfmpegPath("./ffmpeg/ffmpeg.exe").save("./ree.mp4");
    }
})
Deno.test({
    name: " feature with progress",
    fn: async() => {
        const thing = new FfmpegClass().inputFile("./input.mp4").setFfmpegPath("./ffmpeg/ffmpeg.exe").saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    }
})