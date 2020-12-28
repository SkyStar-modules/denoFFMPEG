import { Progress } from "./types.ts";
import { readLines } from "https://deno.land/std@0.80.0/io/mod.ts";
/**
 * Private Class for ffmpeg rendering
 */
export class Processing {
    protected __input                   =    "";
    protected __ffmpegDir               =    "";
    protected __outputFile              =    "";
    protected __niceness                =    "";
    protected __vbitrate: Array<string> =    [];
    protected __abitrate: Array<string> =    [];
    protected __filters:  Array<string> =    [];
    protected __vidCodec: Array<string> =    [];
    protected __audCodec: Array<string> =    [];
    protected __stderr:   Array<string> =    [];
    protected __aBR                     =     0;
    protected __vBR                     =     0;
    protected __noaudio                 = false;
    protected __novideo                 = false;
    protected __outputPipe              = false;
    protected __inputIsURL              = false;
    protected __Process!: Deno.Process;

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
        for await (const line of readLines(this.__Process.stderr!)) {
            if (line) {
                if (line.includes('encoder')) encFound++;
                if (stderrStart === true) {
                    this.__stderr.push(line);
                    if ((i == 8 && !this.__inputIsURL) || (i == 7 && this.__inputIsURL)) {
                        const dur: string = line.trim().replaceAll("Duration: ", "");
                        const timeArr: Array<string> = dur.substr(0, dur.indexOf(",")).split(":");
                        timeS = ((Number.parseFloat(timeArr[0]) * 60 + parseFloat(timeArr[1])) * 60 + parseFloat(timeArr[2]));
                    }
                    if ((i == 9 && !this.__inputIsURL) || (i == 8 && this.__inputIsURL)) {
                        const string: string = line.trim();
                        totalFrames = timeS * Number.parseFloat(string.substr(string.indexOf('kb/s,'), string.indexOf('fps') - string.indexOf('kb/s,')).replaceAll("kb/s,", "").trim());
                    }
                    if (line.includes("encoder") && (encFound > 3 || i >= 49)) {i = 0;stderrStart = false;}
                } else {
                    if (i < 13) temp.push(line);
                    if (i == 12) {
                        if (temp[0] == "progress=end") return;
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
    }
    /**
     * Clear all filters and everything for audio or video
     * 
     */
    private __clear(input: string): void {
        switch (input.toLowerCase()) {
            case "audio":
                this.__audCodec = [];
                this.__aBR = 0;
                this.__abitrate = [];
                break;
            case "video":
                this.__vidCodec = [];
                this.__vBR = 0;
                this.__vbitrate = [];
                this.__filters = [];
                break;
            default:
                throw new Error("tried to clear input. But no input was specified!\r\nIf you see this. Something is probably fucked");
        }
        return;
    }
    /**
     * Format & process all data to run ffmpeg
     */
    private __formatting(): Array<string> {
        const temp = [this.__ffmpegDir];
        if (this.__niceness !== "") temp.push("-n", this.__niceness);

        temp.push("-hide_banner", "-nostats","-y", "-i", this.__input);
        if (this.__noaudio) {
            temp.push("-an");
            this.__clear("audio");
        }
        if (this.__novideo) {
            temp.push("-vn");
            this.__clear("video");
        }
        if (this.__audCodec.length > 0) this.__audCodec.forEach(x => temp.push(x));
        if (this.__vidCodec.length > 0) this.__vidCodec.forEach(x => temp.push(x));
        if (this.__filters.length > 0) temp.push("-vf", this.__filters.join(","));
        if (this.__abitrate.length > 0) this.__abitrate.forEach(x => temp.push(x));
        if (this.__vbitrate.length > 0) this.__vbitrate.forEach(x => temp.push(x));
        temp.push("-progress", "pipe:2", this.__outputFile);
        return temp;
    }
    /**
     * Check's for common error's made by the user
     */
    private __errorCheck(): void {
        const errors: Array<string> = [];
        if (this.__audCodec.length > 0 && (this.__audCodec.join("").includes("undefined") || this.__audCodec.includes("null"))) {errors.push("one or more audio codec options are undefined")}
        if (this.__vidCodec.length > 0 && (this.__vidCodec.join("").includes("undefined") || this.__vidCodec.includes("null"))) {errors.push("one or more video codec options are undefined")}
        if (this.__vbitrate.length > 0 && (this.__vBR == 0 || Number.isNaN(this.__vBR) == true)) {errors.push("video Bitrate is NaN")}
        if (this.__abitrate.length > 0 && (this.__aBR == 0 || Number.isNaN(this.__aBR) == true)) {errors.push("audio Bitrate is NaN")}
        if (!this.__input || this.__input === "") {errors.push("No input specified!")}
        if ((!this.__outputFile || this.__outputFile == "") && !this.__outputPipe) {errors.push("No output specified!")}
        if (!this.__ffmpegDir || this.__ffmpegDir == "") {errors.push("No ffmpeg directory specified!")}
        if (this.__filters.length > 0 && this.__filters.join("").includes("undefined")) {errors.push("Filters were selected, but the field is incorrect or empty")}
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
        await this.__Process.stderrOutput();
        this.__Process.close()
        return;
    }
    private async __test(): Promise<void> {
        await this.__Process.status();
        this.__Process.close()
        return;
    }
    /**
     * run method without progress data
     */
    protected __run(): Promise<void> {
        this.__errorCheck();
        this.__Process = Deno.run({
            cmd: this.__formatting(),
            stderr: "piped",
            stdout: "piped"
        });
        return this.__WaitProcess()
    }
    /**
     * run method with progress data
     */
    protected __runWithProgress(): AsyncGenerator<Progress,void,void> {
        this.__errorCheck();
        this.__Process = Deno.run({
            cmd: this.__formatting(),
            stderr: "piped",
            stdout: "piped"
        });
        this.__test();
        return this.__getProgress();
    }
}