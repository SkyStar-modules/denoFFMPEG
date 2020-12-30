import { Progress } from "./types.ts";
import { readLines } from "https://deno.land/std@0.80.0/io/mod.ts";
/**
 * Private Class for ffmpeg rendering
 */
export class Processing {
    protected input                   =    "";
    protected ffmpegDir               =    "";
    protected outputFile              =    "";
    protected niceness                =    "";
    protected vbitrate: Array<string> =    [];
    protected abitrate: Array<string> =    [];
    protected filters:  Array<string> =    [];
    protected vidCodec: Array<string> =    [];
    protected audCodec: Array<string> =    [];
    protected stderr:   Array<string> =    [];
    protected aBR                     =     0;
    protected vBR                     =     0;
    protected noaudio                 = false;
    protected novideo                 = false;
    protected outputPipe              = false;
    protected inputIsURL              = false;
    protected Process!: Deno.Process;

    /**
     * Get the progress of the ffmpeg instancegenerator
     * 
     * Returns: {
     * ETA: Date,
     * percentage: Number
     * }
     */
    protected async* __getProgress(): AsyncGenerator<Progress,void,void> {
        let i = 1;
        let temp: Array<string> = [];
        let stderrStart = true;
        let timeS = NaN;
        let totalFrames = NaN;
        let encFound = 0;
        for await (const line of readLines(this.Process.stderr!)) {
            if (line) {
                if (line.includes('encoder')) encFound++;
                if (stderrStart === true) {
                    this.stderr.push(line);
                    if ((i == 8 && !this.inputIsURL) || (i == 7 && this.inputIsURL)) {
                        const dur: string = line.trim().replaceAll("Duration: ", "");
                        const timeArr: Array<string> = dur.substr(0, dur.indexOf(",")).split(":");
                        timeS = ((Number.parseFloat(timeArr[0]) * 60 + parseFloat(timeArr[1])) * 60 + parseFloat(timeArr[2]));
                    }
                    if ((i == 9 && !this.inputIsURL) || (i == 8 && this.inputIsURL)) {
                        const string: string = line.trim();
                        totalFrames = timeS * Number.parseFloat(string.substr(string.indexOf('kb/s,'), string.indexOf('fps') - string.indexOf('kb/s,')).replaceAll("kb/s,", "").trim());
                    }
                    if (line.includes("encoder") && (encFound > 3 || i >= 49)) {
                        i = 0;
                        stderrStart = false;
                    }
                } else {
                    if (line === "progress=end") break;
                    if (i < 13) temp.push(line);
                    if (i == 12) {
                        let stdFrame: number = Number.parseInt(temp[0].replaceAll("frame=", "").trim());
                        let stdFPS: number = Number.parseFloat(temp[1].replaceAll("fps=", "").trim()) + 0.01;
                        if (temp[0].includes("frame=  ")) {
                            stdFrame = Number.parseInt(temp[1].replaceAll("frame=", "").trim());
                            stdFPS = Number.parseFloat(temp[2].replaceAll("fps=", "").trim()) + 0.01;
                        }
                        const progressOBJ: Progress = {
                            ETA: new Date(Date.now() + (totalFrames - stdFrame) / stdFPS * 1000),
                            percentage: Number.parseFloat((stdFrame / totalFrames * 100).toFixed(2))
                        };
                        if (!Number.isNaN(stdFPS) && !Number.isNaN(stdFrame)) yield progressOBJ;
                        i = 0;
                        temp = [];
                    }
                }
                i++
            }
        }
        await this.__test();
        this.Process.stdout!.close();
        this.Process.stderr!.close();
    }
    /**
     * Clear all filters and everything for audio or video
     * 
     */
    private __clear(input: string): void {
        switch (input.toLowerCase()) {
            case "audio":
                this.audCodec = [];
                this.aBR = 0;
                this.abitrate = [];
                break;
            case "video":
                this.vidCodec = [];
                this.vBR = 0;
                this.vbitrate = [];
                this.filters = [];
                break;
            default:
                throw "INTERNAL ERROR: 'tried to clear input. But no input was specified!'";
        }
        return;
    }
    /**
     * Format & process all data to run ffmpeg
     */
    private __formatting(): Array<string> {
        const temp = [this.ffmpegDir];
        if (this.niceness !== "") temp.push("-n", this.niceness);

        temp.push("-hide_banner", "-nostats","-y", "-i", this.input);
        if (this.noaudio) {
            temp.push("-an");
            this.__clear("audio");
        }
        if (this.novideo) {
            temp.push("-vn");
            this.__clear("video");
        }
        if (this.audCodec.length > 0) this.audCodec.forEach(x => temp.push(x));
        if (this.vidCodec.length > 0) this.vidCodec.forEach(x => temp.push(x));
        if (this.filters.length > 0) temp.push("-vf", this.filters.join(","));
        if (this.abitrate.length > 0) this.abitrate.forEach(x => temp.push(x));
        if (this.vbitrate.length > 0) this.vbitrate.forEach(x => temp.push(x));
        temp.push("-progress", "pipe:2", this.outputFile);
        return temp;
    }
    /**
     * Check's for common error's made by the user
     */
    private __errorCheck(): void {
        const errors: Array<string> = [];
        if (this.audCodec.length > 0 && (this.audCodec.join("").includes("undefined") || this.audCodec.includes("null"))) {errors.push("one or more audio codec options are undefined")}
        if (this.vidCodec.length > 0 && (this.vidCodec.join("").includes("undefined") || this.vidCodec.includes("null"))) {errors.push("one or more video codec options are undefined")}
        if (this.vbitrate.length > 0 && (this.vBR == 0 || Number.isNaN(this.vBR) == true)) {errors.push("video Bitrate is NaN")}
        if (this.abitrate.length > 0 && (this.aBR == 0 || Number.isNaN(this.aBR) == true)) {errors.push("audio Bitrate is NaN")}
        if (!this.input || this.input === "") {errors.push("No input specified!")}
        if ((!this.outputFile || this.outputFile == "") && !this.outputPipe) {errors.push("No output specified!")}
        if (!this.ffmpegDir || this.ffmpegDir == "") {errors.push("No ffmpeg directory specified!")}
        if (this.filters.length > 0 && this.filters.join("").includes("undefined")) {errors.push("Filters were selected, but the field is incorrect or empty")}
        if (errors.length > 0) {
            const errorList: string = errors.join("\r\n");
            throw new Error(errorList);
        }
        return;
    }
    /**
     * Wait method for run
     */
    private async __WaitProcess(): Promise<void> {
        await this.Process.stderrOutput();
        this.Process.stdout!.close();
        this.Process.close();
        return;
    }
    private async __test(): Promise<void> {
        await this.Process.status();
        this.Process.close();
        return;
    }
    /**
     * run method without progress data
     */
    protected __run(): Promise<void> {
        this.__errorCheck();
        this.Process = Deno.run({
            cmd: this.__formatting(),
            stderr: "piped",
            stdout: "piped"
        });
        return this.__WaitProcess();
    }
    /**
     * run method with progress data
     */
    protected __runWithProgress(): AsyncGenerator<Progress,void,void> {
        this.__errorCheck();
        this.Process = Deno.run({
            cmd: this.__formatting(),
            stderr: "piped",
            stdout: "piped"
        });
        return this.__getProgress();
    }
}