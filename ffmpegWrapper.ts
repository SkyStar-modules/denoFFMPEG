/**
* Written & Maintained by only Christiaan 'MierenMans' van Boheemen
* Property of Christiaan van Boheemen
*/
import * as path from "https://deno.land/std@0.78.0/path/mod.ts";
import EventEmitter from "https://deno.land/std@0.78.0/node/events.ts";
import { Filters, Spawn } from "./interfaces.ts";

export class ffmpeg extends EventEmitter {
    private input:      string        =    "";
    private ffmpegDir:  string        =    "";
    private outputFile: string        =    "";
    private vbitrate:   Array<string> =    [];
    private abitrate:   Array<string> =    [];
    private filters:    Array<string> =    [];
    private vidCodec:   Array<string> =    [];
    private audCodec:   Array<string> =    [];
    private aBR:        number        =     0;
    private vBR:        number        =     0;
    private fatalError: boolean       =  true;
    private noaudio:    boolean       = false;

    public constructor(ffmpeg: Spawn, FE: boolean) {
        super();
        this.input = path.resolve(ffmpeg.input); // input file location, mag later worden gespecified
        this.ffmpegDir = path.resolve(ffmpeg.ffmpegDir); // mag ./dir/ffmpeg.exe zijn. mag later worden gespecified
        if (ffmpeg.fatalError === false || FE === false) this.fatalError = false;
    }
    public setFfmpegPath(ffmpegDir: string): this {
        if (ffmpegDir) this.ffmpegDir = path.resolve(ffmpegDir);
        return this;
    }
    public inputFile(input: string): this {
        this.input = path.resolve(input);
        return this;
    }
    public save(output: string): void {
        this.outputFile = path.resolve(output);
        this.run();
        return;
    }
    public noAudio(): this {
        this.noaudio = true;
        return this;
    }
    public audioCodec(codec: string, options: Object): this {
        this.audCodec = ["-c:a", codec];
        if (codec == "" || codec == "null" || codec == "undefined") this.audCodec = ["-c:a", "undefined"];
        Object.entries(options).forEach(x => this.audCodec.push("-" + x[0], x[1]));
        return this;
    }
    public videoCodec(codec: string, options: Object): this {
        this.vidCodec = ["-c:v", codec];
        if (codec == "" || codec == "null" || codec == "undefined") this.vidCodec = ["-c:v", "undefined"];
        Object.entries(options).forEach(x => this.vidCodec.push("-" + x[0], x[1]));
        return this;
    }
    public audioBitrate(bitrate: number): this {
        this.aBR = bitrate;
        this.abitrate = ["-b:a", String(bitrate)];
        return this;
    }
    public videoBitrate(bitrate: number|string, cbr: boolean = true): this {
        let brString: string = String(bitrate);
        this.vBR = Number.parseInt(brString);
        let bitR: number;
        switch (brString.charAt(brString.length-1).toLowerCase()) {
            case "mb/s":
            case "mbps":
            case "m":
                bitR = Number.parseInt(brString) * 1000000;
                break;
            case "kb/s":
            case "kbps":
            case "k":
            default:
                bitR = Number.parseInt(brString) * 1000;
                break;
        }
        this.vbitrate = ['-maxrate', String(bitR * 2), '-minrate', String(bitR / 4), "-b:v", String(bitR), '-bufsize', String(bitR * 5)];
        if (cbr == true) this.vbitrate = ['-maxrate', String(bitR), '-minrate', String(bitR), "-b:v", String(bitR), '-bufsize', '3M'];
        return this;
    }
    public addFilters(Filters: Array<Filters>): this {
        Filters.forEach(x => {
            let temp: string = x.filterName + '="';
            Object.entries(x.options).forEach((j, i) => {
                if (i > 0) {temp += `: ${j[0]}='${j[1]}'`} else {temp += `${j[0]}='${j[1]}'`}
            })
            this.filters.push(temp)
        })
        return this;
    }
    private errorCheck(): void {
        let error: Array<string> = [];
        if (this.audCodec.length > 0 && this.audCodec.join("").includes("undefined") || this.audCodec.includes("null")) error.push("one or more audio codec options are undefined")
        if (this.vidCodec.length > 0 && this.vidCodec.join("").includes("undefined") || this.vidCodec.includes("null")) error.push("one or more video codec options are undefined")
        if (this.vbitrate.length > 0 && this.vBR !== 0 && Number.isNaN(this.vBR) == true) error.push("video Bitrate is NaN");
        if (this.abitrate.length > 0 && this.aBR !== 0 && Number.isNaN(this.aBR) == true) error.push("audio Bitrate is NaN");
        if (!this.input) error.push("No input specified!");
        if (!this.outputFile || this.outputFile == "") error.push("No output specified!");
        if (!this.ffmpegDir || this.ffmpegDir == "") error.push("No ffmpeg directory specified!");
        if (this.filters.length > 0 && this.filters.join("").includes("undefined")) error.push("Filters were selected, but the field is incorrect or empty");
        if (error.join("") !== "") {
            let errors: string = error.join("\r\n");
            super.emit('error', errors);
            if (this.fatalError == true) throw new Error(errors);
        }
        return;
    }
    private formatting(): Array<string> {
        let temp = [this.ffmpegDir, "-y", "-i", this.input]; // Add required commands
        if (this.noaudio) temp.push("-an")
        if (this.audCodec.length > 0) this.audCodec.forEach(x => temp.push(x)); // Push audio codec
        if (this.vidCodec.length > 0) this.vidCodec.forEach(x => temp.push(x)); // Push video codec
        if (this.filters.length > 0) temp.push("-vf", this.filters.join(",")); // Push all Filters
        if (this.abitrate.length > 0) this.abitrate.forEach(x => temp.push(x)); // Push audio bitrate
        if (this.vbitrate.length > 0) this.vbitrate.forEach(x => temp.push(x)); // Push video bitrate
        temp.push(this.outputFile);
        return temp;
    }
    private async run() {
        await this.errorCheck();
        let ree = await this.formatting()
        const p = Deno.run({
            cmd: ree,
            stderr: "piped",
            stdout: "piped"
        });
        let error: string = new TextDecoder("utf-8").decode(await p.stderrOutput());
        console.log(error)
        if (error.includes("Conversion failed!")) super.emit('error', error);
        let status = await p.status();
        await p.close();
        super.emit('end', status);
    }
}