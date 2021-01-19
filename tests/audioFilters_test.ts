import { FfmpegClass, Filters } from "../mod.ts";
const filter:Filters = {
    filterName: "afade",
    options: {
        t: "in",
        ss: 0,
        d: 15
    }
}
Deno.test({
    name: "audioFilters feature with progress",
    fn: async() => {
        const thing = new FfmpegClass({
            input: "./input.mp4"
        }).setFfmpegPath("./ffmpeg/ffmpeg.exe").audioFilters(filter).saveWithProgress("./ree.mp4");
        for await (const progress of thing) {
            console.log(progress);
        }
    },
    sanitizeOps: true,
    sanitizeResources: true
})
Deno.test({
    name: "audioFilters feature",
    fn: async() => {
        await new FfmpegClass({
            input: "./input.mp4"
        }).setFfmpegPath("./ffmpeg/ffmpeg.exe").audioFilters(filter).save("./ree.mp4");
    },
    sanitizeOps: true,
    sanitizeResources: true
})