import { Progress } from "./types.ts";
import { readLines } from "../deps.ts"
import * as log from "./logger.ts";

/**
 * Private Class for ffmpeg rendering
 */
export class Processing {
    protected ffmpegDir                    = "ffmpeg";
    protected outputFile                   =       "";
    protected niceness                     =       "";
    protected input:              string[] =       [];
    protected vbitrate:           string[] =       [];
    protected abitrate:           string[] =       [];
    protected simpleVideoFilter:  string[] =       [];
    protected complexVideoFilter: string[] =       [];
    protected vidCodec:           string[] =       [];
    protected audCodec:           string[] =       [];
    protected stderr:             string[] =       [];
    protected aBR                          =        0;
    protected vBR                          =        0;
    protected debug                        =     true;
    protected noaudio                      =    false;
    protected novideo                      =    false;
    protected outputPipe                   =    false;
    protected firstInputIsURL              =    false;
    protected Process!: Deno.Process;

    /**
     * Get the progress of the ffmpeg instancegenerator
     * 
     * Yields: {
     * ETA: Date,
     * percentage: Number
     * }
     */
    protected async* __getProgress(): AsyncGenerator<Progress> {
        let i = 1;
        let stderrStart = true;
        let timeS = 0;
        let totalFrames = 0;
        let encFound = 0;
        let currentFrame = 0;
        let currentFPS = 0;
        for await (const line of readLines(this.Process.stderr!)) {
            if (line.includes('encoder')) encFound++;
            if (stderrStart === true) {

                this.stderr.push(line);

                if ((i == 7 && !this.firstInputIsURL) || (i == 6 && this.firstInputIsURL)) {
                    const dur: string = line.trim().replaceAll("Duration: ", "");
                    const timeArr: string[] = dur.substr(0, dur.indexOf(",")).split(":");
                    timeS = ((Number.parseFloat(timeArr[0]) * 60 + parseFloat(timeArr[1])) * 60 + parseFloat(timeArr[2]));
                }

                if ((i == 8 && !this.firstInputIsURL) || (i == 7 && this.firstInputIsURL)) {
                    const string: string = line.trim();
                    totalFrames = Math.floor(timeS * Number.parseFloat(string.substr(string.indexOf('kb/s,'), string.indexOf('fps') - string.indexOf('kb/s,')).replaceAll("kb/s,", "").trim()));
                }

                if (line.includes("encoder") && encFound > 2) {
                    i = 0;
                    stderrStart = false;
                }
            } else {
                if (line === "progress=end") break;
                if (line.includes("frame=")) {
                    currentFrame = Number.parseInt(line.replaceAll("frame=", "").trim())
                }
                if (line.includes("fps=")) {
                    currentFPS = Number.parseFloat(line.replaceAll("fps=", "").trim())
                }
                if (i == 12) {
                    const progressOBJ: Progress = {
                        ETA: new Date(Date.now() + (totalFrames - currentFrame) / currentFPS * 1000),
                        percentage: Number.parseFloat((currentFrame / totalFrames * 100).toFixed(2))
                    }
                    if (!Number.isNaN(totalFrames) && !Number.isNaN(currentFrame) && !Number.isNaN(currentFPS) && currentFPS !== 0) {
                        yield progressOBJ;
                    } else if (currentFPS !== 0 && this.debug && totalFrames > currentFrame) {
                        log.internalWarning(`progress yield is invalid because one of the following values is NaN\ntotalFrames:${totalFrames}\ncurrentFrame:${currentFrame}\ncurrentFPS:${currentFPS}`)
                    }
                    i = 0;
                }
            }
            i++
        }
        await this.__closeProcess(true);
        yield {
            ETA: new Date(),
            percentage: 100
        };
    }

    /**
     * Clear all filters and everything for audio or video
     * 
     */
    private __clear(input: string): void {
        switch (input.toLowerCase()) {
            case "audio":
                if (this.aBR !== 0) {
                    log.warning("video bitrate was selected while no audio mode was selected!\nPlease remove video bitrate");
                }

                if (this.audCodec.length > 0) {
                    log.warning("video codec was selected while no audio mode was selected!\nPlease remove video codec");
                }

                this.audCodec = [];
                this.aBR = 0;
                this.abitrate = [];
                break;

            case "video":
                if (this.complexVideoFilter.length > 0 || this.simpleVideoFilter.length > 0) {
                    log.warning("video Filters was selected while no video mode was selected!\nPlease remove video filters");
                }

                if (this.vBR !== 0) {
                    log.warning("video bitrate was selected while no video mode was selected!\nPlease remove video bitrate");
                }

                if (this.vidCodec.length > 0) {
                    log.warning("video codec was selected while no video mode was selected!\nPlease remove video codec");
                }

                this.vidCodec = [];
                this.vBR = 0;
                this.vbitrate = [];
                this.simpleVideoFilter = [];
                this.complexVideoFilter = [];
                break;

            default:
                log.internalError("tried to clear input. But invalid input was specified!");
        }
        return;
    }

    /**
     * Format & process all data to run ffmpeg
     */
    private __formatting(): string[] {
        const temp = [this.ffmpegDir];
        if (this.niceness !== "") temp.push("-n", this.niceness);

        temp.push("-hide_banner", "-nostats","-y");
        for (let i = 0; i < this.input.length; i++) {
            temp.push("-i", this.input[i]);
        }
        if (this.noaudio) {
            temp.push("-an");
            this.__clear("audio");
        }

        if (this.novideo) {
            temp.push("-vn");
            this.__clear("video");
        }

        if (this.audCodec.length > 0) temp.concat(this.audCodec);
        if (this.vidCodec.length > 0) temp.concat(this.vidCodec);

        if (this.simpleVideoFilter.length > 0) temp.push("-vf", this.simpleVideoFilter.join(","));
        if (this.complexVideoFilter.length > 0) temp.push("-filter_complex", this.complexVideoFilter.join(","));

        if (this.abitrate.length > 0) temp.concat(this.abitrate);
        if (this.vbitrate.length > 0) temp.concat(this.vbitrate);

        temp.push("-progress", "pipe:2", this.outputFile);
        return temp;
    }

    /**
     * Check's for common error's made by the user
     */
    private __errorCheck(): void {
        const errors: string[] = [];
        if (this.audCodec.length > 0 && (this.audCodec.join("").includes("undefined") || this.audCodec.includes("null"))) {
            errors.push("one or more audio codec options are undefined");
        }

        if (this.vidCodec.length > 0 && (this.vidCodec.join("").includes("undefined") || this.vidCodec.includes("null"))) {
            errors.push("one or more video codec options are undefined");
        }

        if (this.vbitrate.length > 0 && (this.vBR === 0 || Number.isNaN(this.vBR))) {
            errors.push("video Bitrate is NaN");
        }

        if (this.abitrate.length > 0 && (this.aBR === 0 || Number.isNaN(this.aBR))) {
            errors.push("audio Bitrate is NaN");
        }
        
        if (this.input.length === 0) {
            errors.push("No input specified!");
        }
        
        if ((!this.outputFile || this.outputFile == "") && !this.outputPipe) {
            errors.push("No output specified!");
        }
        
        if (!this.ffmpegDir || this.ffmpegDir == "") {
            errors.push("No ffmpeg directory specified!");
        }
        
        if (this.simpleVideoFilter.length > 0 && this.complexVideoFilter.length > 0) {
            errors.push("simple & complex filters cannot be used at the same time");
        }
        
        if (this.complexVideoFilter.length > 0 && this.complexVideoFilter.join("").includes("undefined")) {
            errors.push("Filters were selected, but the field is incorrect or empty");
        }
        
        if (this.simpleVideoFilter.length > 0 && this.simpleVideoFilter.join("").includes("undefined")) {
            errors.push("Filters were selected, but the field is incorrect or empty");
        }
        
        if (errors.length > 0) {
            const errorList: string = errors.join("\n");
            log.formatError(errorList);
        }
        return;
    }

    /**
     * Wait method for run
     */
    private async __closeProcess(hasProgress:boolean): Promise<void> {
        let stderr = this.stderr.join("");
        if (!hasProgress) {
            stderr = new TextDecoder().decode(await this.Process.stderrOutput());
        } else {
            this.Process.stderr!.close()
        }

        const status = await this.Process.status();
        this.Process.close();

        if (!status.success) {
            log.ffmpegError(stderr);
        }
        return;
    }

    /**
     * close method for runWithProgress
     */

    /**
     * run method without progress data
     */
    protected __run(): Promise<void> {
        this.__errorCheck();
        this.Process = Deno.run({
            cmd: this.__formatting(),
            stderr: "piped",
            stdout: "null"
        });
        return this.__closeProcess(false);
    }

    /**
     * run method with progress data
     */
    protected __runWithProgress(): AsyncGenerator<Progress> {
        this.__errorCheck();
        this.Process = Deno.run({
            cmd: this.__formatting(),
            stderr: "piped",
            stdout: "null"
        });
        return this.__getProgress();
    }
}