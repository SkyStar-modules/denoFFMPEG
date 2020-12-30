import { Processing } from "./processorClass.ts";
import { Spawn, Progress, Filters } from "./types.ts";

/**
 * Public Class for ffmpeg rendering
 */
export class FfmpegClass extends Processing {
    /**
     * Make new ffmpeg instance.
     * 
     * Parameter 1: {
     *    ffmpegDir?: string,
     *    niceness?: number | string,
     *    source?: string
     * }
     * 
     */
    public constructor(options?:Spawn) {
        super();
        if (options) {
            Object.entries(options).forEach((j: string[]) => {
                switch (j[0].toLowerCase()) {
                    case "ffmpegdir":
                        this.ffmpegDir = j[1];
                        break;
                    case "niceness":
                        if (Deno.build.os !== "windows") this.niceness = j[1];
                        break;
                    case "source":
                        if (j[1].includes('http')) this.inputIsURL = true;
                        this.input = j[1];
                        break;
                    default:
                        throw 'Option "' + j[0] + '" not found! Please remove it';
                }
            })
        }
        return this;
    }
    /**
     * Set path to the ffmpeg binary file
     * 
     * Parameter 1: ffmpegDir path to the ffmpeg binary
     * 
     */
    public setFfmpegPath(ffmpegPath: string): this {
        if (ffmpegPath) this.ffmpegDir = ffmpegPath;
        return this;
    }
    /**
     * Set path to the inputfile
     * 
     * Parameter 1: input path to the inputfile
     * 
     */
    public inputFile(input: string): this {
        if (input) this.input = input;
        return this;
    }
    /**
     * Disable Audio and remove all audio settings
     * 
     */
    public noAudio(): this {
        this.noaudio = true;
        return this;
    }
    /**
     * Disable video and remove all video settings
     * 
     */
    public noVideo(): this {
        this.novideo = true;
        return this;
    }
    /**
     * Set audio codec
     * 
     * Parameter 1: codec Audio Codec name
     * Parameter 2: options options object for codec supported options
     *
     */
    public audioCodec(codec: string, options: Record<string, string>): this {
        this.audCodec = ["-c:a", codec];
        if (codec == "" || codec == "null" || codec == "undefined") this.audCodec = ["-c:a", "undefined"];
        if (options) Object.entries(options).forEach(x => this.audCodec.push("-" + x[0], x[1]));
        return this;
    }
    /**
     * Set video codec
     * 
     * Parameter 1: codec video Codec name
     * Parameter 2: options Options object for codec supported options
     *
     */
    public videoCodec(codec: string, options: Record<string, string>): this {
        this.vidCodec = ["-c:v", codec];
        if (codec == "" || codec == "null" || codec == "undefined") this.vidCodec = ["-c:v", "undefined"];
        if (options) Object.entries(options).forEach(x => this.vidCodec.push("-" + x[0], x[1]));
        return this;
    }
    /**
     * Set audio bitrate in kbps
     * 
     * Parameter 1: bitrate use bitrate you want in kbps
     * 
     */
    public audioBitrate(bitrate: number): this {
        this.aBR = bitrate;
        this.abitrate = ["-b:a", String(bitrate)];
        return this;
    }
    /**
     * Set video bitrate in mbps or kbps
     * 
     * Parameter 1: bitrate use bitrate you want in mbps(15m) or kbps(15000k)
     * Parameter 2: cbr enable constant bitrate (default = true)
     * 
     */
    public videoBitrate(bitrate: number|string, cbr = true): this {
        const brString = String(bitrate);
        this.vBR = parseInt(brString);
        let bitR: number;
        switch (brString.charAt(brString.length-1).toLowerCase()) {
            case "m":
                bitR = parseInt(brString) * 1000000;
                break;
            case "k":
            default:
                bitR = parseInt(brString) * 1000;
                break;
        }
        this.vbitrate = ['-maxrate', String(bitR), '-minrate', String(bitR), "-b:v", String(bitR), '-bufsize', '3M'];
        if (cbr == false) this.vbitrate = ['-maxrate', String(bitR * 2), '-minrate', String(bitR / 4), "-b:v", String(bitR), '-bufsize', String(bitR * 5)];
        return this;
    }
    /**
     * Set video filters
     * 
     * Parameter 1: Filters Array of filter Objects you want to use for processing
     * 
     */
    public videoFilters(...Filters:Array<Filters>): this {
        Filters.forEach(x => {
            let temp: string = x.filterName + '="';
            Object.entries(x.options).forEach((j, i) => {
                if (i > 0) {temp += `: ${j[0]}='${j[1]}'`} else {temp += `${j[0]}='${j[1]}'`}
            });
            this.filters.push(temp);
        });
        return this;
    }
    /**
     * set output path and encode
     * 
     * parameter 1: output set output path
     * 
     * returns: void
     * 
     */
    public save(output:string): Promise<void> {
        this.outputFile = output;
        return this.__run();
    }
        /**
     * set output path and encode
     * 
     * parameter 1: output set output path
     * 
     * returns: Promise<AsyncGenerator<Progress>>
     * 
     */
    public saveWithProgress(output:string): AsyncGenerator<Progress,void,void> {
        this.outputFile = output;
        return this.__runWithProgress();
    }
}

export default function ffmpeg(options?: Spawn): FfmpegClass {
    return new FfmpegClass(options);
}