/**
* Written & Maintained by only Christiaan 'MierenMans' van Boheemen
* Property of Christiaan van Boheemen
*/
import * as path from "https://deno.land/std@0.79.0/path/mod.ts";
import { EventEmitter } from "https://deno.land/x/event@0.2.0/mod.ts";
import { readLines } from "https://deno.land/std@0.79.0/io/mod.ts";
import { assert } from "https://deno.land/std@0.79.0/testing/asserts.ts"
type Events = {
    progress: [Progress];
    end: [Status];
    error: [string]
}

interface Filters {
    filterName: string;
    options: Record<string, unknown>
}
// interface SpawnOptions {
//     timeout: number,
//     niceness: number,
//     logger: string,
//     stdoutLines: number
// }
interface Spawn {
    ffmpegDir: string;
    // options: SpawnOptions,
    fatalError?: boolean
}
interface Status {
    success: boolean;
    code: number;
}
interface Progress {
    ETA: Date;
    percentage: number 
}

export class ffmpeg extends EventEmitter<Events> {
    #input:         string        =    "";
    #ffmpegDir:     string        =    "";
    #outputFile:    string        =    "";
    #vbitrate:      Array<string> =    [];
    #abitrate:      Array<string> =    [];
    #filters:       Array<string> =    [];
    #vidCodec:      Array<string> =    [];
    #audCodec:      Array<string> =    [];
    #stderr:        Array<string> =    [];
    #aBR:           number        =     0;
    #vBR:           number        =     0;
    #noAudio:       boolean       = false;
    #noVideo:       boolean       = false;
    #Process!:      Deno.Process;
    public constructor(...param: Array<string|Spawn>) {
        super();
        param.forEach(x => {
            if (typeof x == "string") {
                this.#input = x;
            }
            if (typeof x == "object") {
                Object.entries(x).forEach(j => {
                    switch (j[0].toLowerCase()) {
                        case "source":
                            this.#input = j[1];
                            break;
                        case "ffmpegdir":
                            this.#ffmpegDir = path.resolve(j[1]);
                    }
                })
            }
        })
        return this;
    }
    public setFfmpegPath(ffmpegDir: string): this {
        if (ffmpegDir) this.#ffmpegDir = path.resolve(ffmpegDir);
        return this;
    }
    public inputFile(input: string): this {
        this.#input = input;
        return this;
    }
    public save(output: string): void {
        this.#outputFile = output;
        this.PRIVATE_METHOD_DONT_FUCKING_USE_run();
        return;
    }
    public noAudio(): this {
        this.#noAudio = true;
        return this;
    }
    public noVideo(): this {
        this.#noVideo = true;
        return this;
    }
    public audioCodec(codec: string, options: Record<string, string>): this {
        this.#audCodec = ["-c:a", codec];
        if (codec == "" || codec == "null" || codec == "undefined") this.#audCodec = ["-c:a", "undefined"];
        Object.entries(options).forEach(x => this.#audCodec.push("-" + x[0], x[1]));
        return this;
    }
    public videoCodec(codec: string, options: Record<string, string>): this {
        this.#vidCodec = ["-c:v", codec];
        if (codec == "" || codec == "null" || codec == "undefined") this.#vidCodec = ["-c:v", "undefined"];
        if (options) Object.entries(options).forEach(x => this.#vidCodec.push("-" + x[0], x[1]));
        return this;
    }
    public audioBitrate(bitrate: number): this {
        this.#aBR = bitrate;
        this.#abitrate = ["-b:a", String(bitrate)];
        return this;
    }
    public videoBitrate(bitrate: number|string, cbr = true): this {
        const brString = String(bitrate);
        this.#vBR = parseInt(brString);
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
        this.#vbitrate = ['-maxrate', String(bitR), '-minrate', String(bitR), "-b:v", String(bitR), '-bufsize', '3M'];
        if (cbr == false) this.#vbitrate = ['-maxrate', String(bitR * 2), '-minrate', String(bitR / 4), "-b:v", String(bitR), '-bufsize', String(bitR * 5)];
        return this;
    }
    public videoFilters(...Filters:Array<Filters>): this {
        Filters.forEach(x => {
            let temp: string = x.filterName + '="';
            Object.entries(x.options).forEach((j, i) => {
                if (i > 0) {temp += `: ${j[0]}='${j[1]}'`} else {temp += `${j[0]}='${j[1]}'`}
            })
            this.#filters.push(temp);
        })
        return this;
    }
    private PRIVATE_METHOD_DONT_FUCKING_USE_errorCheck(): void {
        const error: Array<string> = [];
        if (this.#audCodec.length > 0 && (this.#audCodec.join("").includes("undefined") || this.#audCodec.includes("null"))) {error.push("one or more audio codec options are undefined")}
        if (this.#vidCodec.length > 0 && (this.#vidCodec.join("").includes("undefined") || this.#vidCodec.includes("null"))) {error.push("one or more video codec options are undefined")}
        if (this.#vbitrate.length > 0 && (this.#vBR == 0 || Number.isNaN(this.#vBR) == true)) {error.push("video Bitrate is NaN")}
        if (this.#abitrate.length > 0 && (this.#aBR == 0 || Number.isNaN(this.#aBR) == true)) {error.push("audio Bitrate is NaN")}
        if (!this.#input) {error.push("No input specified!")}
        if (!this.#outputFile || this.#outputFile == "") {error.push("No output specified!")}
        if (!this.#ffmpegDir || this.#ffmpegDir == "") {error.push("No ffmpeg directory specified!")}
        if (this.#filters.length > 0 && this.#filters.join("").includes("undefined")) {error.push("Filters were selected, but the field is incorrect or empty")}
        if (error.join("") !== "") {
            const errors: string = error.join("\r\n");
            super.emit('error', errors);
        }
        return;
    }
    private PRIVATE_METHOD_DONT_FUCKING_USE_clear(input: string): void {
        switch (input.toLowerCase()) {
            case "audio":
                this.#audCodec = [];
                this.#aBR = 0;
                this.#abitrate = [];
                break;
            case "video":
                this.#vidCodec = [];
                this.#vBR = 0;
                this.#vbitrate = [];
                this.#filters = [];
                break;
            default:
                throw new Error("tried to clear input. But no input was specified!\r\nIf you see this. Something is probably fucked")
        }
        return;
    }
    private PRIVATE_METHOD_DONT_FUCKING_USE_formatting(): Array<string> {
        const temp = [this.#ffmpegDir, "-hide_banner", "-nostats","-y", "-i", this.#input];
        if (this.#noAudio) {
            temp.push("-an")
            this.PRIVATE_METHOD_DONT_FUCKING_USE_clear("audio");
        }
        if (this.#noVideo) {
            temp.push("-vn");
            this.PRIVATE_METHOD_DONT_FUCKING_USE_clear("video")
        }
        if (this.#audCodec.length > 0) this.#audCodec.forEach(x => temp.push(x))
        if (this.#vidCodec.length > 0) this.#vidCodec.forEach(x => temp.push(x))
        if (this.#filters.length > 0) temp.push("-vf", this.#filters.join(","))
        if (this.#abitrate.length > 0) this.#abitrate.forEach(x => temp.push(x))
        if (this.#vbitrate.length > 0) this.#vbitrate.forEach(x => temp.push(x))
        temp.push("-progress", "pipe:2", this.#outputFile);
        return temp;
    }
    private async PRIVATE_METHOD_DONT_FUCKING_USE_getStdout(): Promise<void> {
        let i = 0;
        let temp: Array<string> = [];
        let stderrStart = true;
        let timeS = NaN;
        let bitrate = NaN;
        let totalFrames = NaN;
        for await (const line of readLines(this.#Process.stderr!)) {
            if (line) {
                if (stderrStart) this.#stderr.push(line);
                if (stderrStart === true && i == 7) {
                    const dur: string = line.trim().replaceAll("Duration: ", "");
                    const timeArr: Array<string> = dur.substr(0, dur.indexOf(",")).split(":");
                    timeS = ((Number.parseFloat(timeArr[0]) * 60 + parseFloat(timeArr[1])) * 60 + parseFloat(timeArr[2]));
                }
                if (stderrStart === true && i == 8) {
                    const string: string = line.trim();
                    bitrate = Number.parseFloat(string.substr(string.indexOf('], '), string.indexOf('kb/s,') - string.indexOf('], ')).replaceAll("], ", "").trim()); 
                    totalFrames = timeS * Number.parseFloat(string.substr(string.indexOf('kb/s,'), string.indexOf('fps') - string.indexOf('kb/s,')).replaceAll("kb/s,", "").trim());
                }
                if (stderrStart === false && i < 13) temp.push(line)
                if (stderrStart === true && i == 38) {i = 0;stderrStart = false;}
                if (stderrStart === false && i == 12) {
                    if (temp[0] == "progress=end") return;
                    let frame: number = Number.parseInt(temp[0].replaceAll("frame=", "").trim());
                    let fps: number = Number.parseFloat(temp[1].replaceAll("fps=", "").trim()) + 0.01;
                    if (temp[0].includes("frame=  ")) {
                        frame = Number.parseInt(temp[1].replaceAll("frame=", "").trim());
                        fps = Number.parseFloat(temp[2].replaceAll("fps=", "").trim()) + 0.01;
                    }
                    const progressOBJ: Progress = {
                        ETA: new Date(Date.now() + (totalFrames - frame) / fps * 1000),
                        percentage: Number.parseFloat((frame / totalFrames * 100).toFixed(2))
                    }
                    if (!Number.isNaN(fps) && !Number.isNaN(frame)) super.emit('progress', progressOBJ);
                    i = 0;
                    temp = [];
                }
                i++
            }
        }
    }
    private async PRIVATE_METHOD_DONT_FUCKING_USE_run(): Promise<void> {
        await this.PRIVATE_METHOD_DONT_FUCKING_USE_errorCheck();
        this.#Process = Deno.run({
            cmd: await this.PRIVATE_METHOD_DONT_FUCKING_USE_formatting(),
            stderr: "piped",
            stdout: "piped"
        });
        this.PRIVATE_METHOD_DONT_FUCKING_USE_getStdout();
        const status = await this.#Process.status()
        await this.#Process.close();
        if (status.success == false) super.emit('error', this.#stderr.join('\r\n'))
        super.emit('end', status);
    }
}