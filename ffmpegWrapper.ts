/**
Written & Maintained by only Christiaan 'MierenMans' van Boheemen
Property of Christiaan van Boheemen
*/
import * as path from "https://deno.land/std@0.76.0/path/mod.ts";
import EventEmitter from "https://deno.land/std@0.78.0/node/events.ts";
import { Filters } from "./interfaces.ts";

export class ffmpeg extends EventEmitter {
    private input:      string        =   "";
    private ffmpegDir:  string        =   "";
    private outputFile: string        =   "";
    private bitrate:    Array<string> =   [];
    private filters:    Array<string> =   [];
    private br:         number        =   0 ;
    private fatalError: boolean       = true;
    /**
    * @arg {string} ffmpegDir -- path to the ffmpeg.exe (can be full path)
    * @arg {string} input -- path to input (can be full path)
    */
    public constructor(ffmpegDir: string, input: string) {
        super();
        this.input = path.resolve(input); // input file location, mag later worden gespecified
        this.ffmpegDir = path.resolve(ffmpegDir); // mag ./dir/ffmpeg.exe zijn. mag later worden gespecified
    }
    /**
     * @arg {string} ffmpegDir -- path to the ffmpeg.exe (can be full path)
     */
    public setFfmpegPath(ffmpegDir: string): this {
        if (ffmpegDir) this.ffmpegDir = path.resolve(ffmpegDir);
        return this;
    }
    /**
     * @arg {string} input -- path to input (can be full path)
     */
    public inputFile(input: string): this {
        this.input = path.resolve(input);
        return this;
    }
    /**
     * @arg {string} output -- output path (can be full path)
     */
    public save(output: string): void {
        this.outputFile = path.resolve(output);
        this.run();
    }
    /**
     * @arg {string} bitrate -- Video bitrate
     * @arg {boolean} cbr -- type false if you want Variable bitrate, else leave this alone
     */
    public videoBitrate(bitrate: number|string, cbr: boolean = true): this {
        let brString: string = String(bitrate);
        this.br = Number.parseInt(brString);
        let bitR: number;
        switch (brString.charAt(brString.length-1).toLowerCase()) {
            case "mb/s":
            case "mbps":
            case "m":
                bitR = Number.parseInt(brString) * 1000000
                break;
            case "kb/s":
            case "kbps":
            case "k":
            default:
                bitR = Number.parseInt(brString) * 1000
                break;
        }
        this.bitrate = ['-maxrate', String(bitR * 2), '-minrate', String(bitR / 4), "-b:v", String(bitR), '-bufsize', String(bitR * 5)];
        if (cbr == true) this.bitrate = ['-maxrate', String(bitR), '-minrate', String(bitR), "-b:v", String(bitR), '-bufsize', '3M'];
        return this;
    }
    /**
     * @arg FilterArray -- array with every filter
     */
    public addFilters(FilterArray: Array<Filters>): this {
        if (FilterArray) {
            FilterArray.forEach(obj => {
                switch (obj.filterName) {
                    case "yadif_cuda":
                    case "yadif":
                        this.filters.push(`${obj.filterName}=${obj.options.mode}:${obj.options.parity}:${obj.options.deint}`)
                        break;
                    case "drawtext":
                        this.filters.push(`drawtext="fontfile='${obj.options.fontfile}': fontcolor='${obj.options.fontcolor}': fontsize='${obj.options.fontsize}': x='${obj.options.x}': y='${obj.options.y}': shadowcolor='${obj.options.shadowcolor}': shadowx='${obj.options.shadowx}': shadowy='${obj.options.shadowy}': text='${obj.options.text}'`)
                        break;
                    // allow for custom filters. Should be a full line
                    default:
                        this.filters.push(obj.custom);
                        break;
                }
            })
        }
        return this;
    }
    private errorCheck() {
        let error: Array<string> =[];
        if (this.br == 0) error.push("Bitrate not specified!")
        if (this.br !== 0 && Number.isNaN(this.br) == true) error.push("Bitrate is NaN")
        if (!this.input) error.push("No input specified!");
        if (!this.outputFile || this.outputFile == "") error.push("No output specified!");
        if (!this.ffmpegDir || this.ffmpegDir == "") error.push("No ffmpeg directory specified!");
        if (this.filters.join("").includes("undefined")) error.push("Filters were selected, but the field is incorrect or empty");
        if (error.join("") !== "") {
            let errors: string = error.join("\r\n");
            super.emit('error', errors);
            if (this.fatalError == true) throw new Error(errors);
        }
        return;
    }
    private formatting(): Array<string> {
        let temp = [this.ffmpegDir, "-y", "-i", this.input]; // Add required commands
        if (this.filters) temp.push("-vf", this.filters.join(",")); // Push all Filters
        if (this.bitrate) this.bitrate.forEach(x => {temp.push(x)}); // Push all 
        temp.push(this.outputFile);
        return temp;
    }
    private async run() {
        this.errorCheck();
        const p = Deno.run({
            cmd: await this.formatting(),
            stderr: "piped",
            stdout: "piped"
        });
        let error: string = new TextDecoder("utf-8").decode(await p.stderrOutput());
        if (error.includes("Conversion failed!")) super.emit('error', error);
        let status = await p.status();
        await p.close();
        super.emit('end', status);
    }
}