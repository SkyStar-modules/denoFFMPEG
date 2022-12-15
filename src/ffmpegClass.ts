import type { Filters, Globals, Progress, Spawn } from "./types.ts";
import { FfmpegError, FormatError, internalWarning, warning } from "./error.ts";
import { readLines, writeAll } from "../deps.ts";
import * as formatter from "./formatter.ts";

export class FfmpegClass {
  #ffmpegDir = "";
  #outputFile: string | "pipe:1" = "";
  #input: string[] = [];
  #outputOptions: string[] = [];
  #inputOptions: Record<string, string | undefined>[] = [];
  #videoBitrateOptions: string[] = [];
  #audioBitrateOptions: string[] = [];
  #videoFilter: string[] = [];
  #complexFilter: string[] = [];
  #audioFilter: string[] = [];
  #videoCodec: string[] = [];
  #audioCodec: string[] = [];
  #stderr: string[] = [];
  #globals: Record<string, string> = {};
  #niceness = -1;
  #threadCount = 0;
  #outputFPS = 0;
  #audioBitrate = 0;
  #videoBitrate = 0;
  #width = -1;
  #height = -1;
  #noAudio = false;
  #noVideo = false;
  #pipedOutput = false;
  #pipedInput: Uint8Array = new Uint8Array();
  #Process!: Deno.Process;

  /** ### Create a new instance of ffmpeg
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts";
   *
   * const ffmpeg = new FfmpegClass({
   *     // Optional
   *     threads: 5,
   *     // Optional. can be set via `FfmpegClass#setFfmpegPath()`
   *     ffmpegDir: "ffmpeg",
   *     // Ignored on windows (should range between -20 and 20)
   *     niceness: 20,
   *     // Optional. can be set via `FfmpegClass#addInput()`
   *     input: "./tests/videos/input.mp4",
   * });
   * ```
   */
  public constructor(options?: Spawn) {
    if (options) {
      for (const [key, value] of Object.entries(options)) {
        switch (key.toLowerCase()) {
          case "threads":
            this.#threadCount = value;
            break;
          case "ffmpegdir":
            this.#ffmpegDir = value;
            break;
          case "niceness":
            if (Deno.build.os === "windows") {
              warning(
                "Niceness is set while using windows\nPlease remove it because it is ignored",
              );
            } else {
              this.#niceness = value;
            }
            break;
          case "input":
            this.#input.push(value);
            this.#inputOptions.push({});
            break;
          default:
            warning(`Option '${value}' not found! Please remove it`);
        }
      }
    }
    return this;
  }

  /** ### Set ffmpeg path
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.setFfmpegPath("./somedir/binary");
   * ffmpeg.setFfmpegPath("ffmpeg"); // this works as long as ffmpeg is in your PATH
   * ```
   */
  public setFfmpegPath(ffmpegPath: string): this {
    if (ffmpegPath) {
      if (this.#ffmpegDir.length > 0 && this.#ffmpegDir !== "ffmpeg") {
        warning(
          "Changing ffmpeg path from " + this.#ffmpegDir + " to " + ffmpegPath,
        );
      }
      this.#ffmpegDir = ffmpegPath;
    }
    return this;
  }

  /** ### Set amount of threads
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.threads(1);
   * ffmpeg.threads(16);
   * ```
   */
  public threads(amount: number): this {
    this.#threadCount = amount;
    return this;
  }

  /** ### Add a input
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.addInput("file.mp4");
   * ffmpeg.addInput("https://some.link/file.mp4");
   * ffmpeg.addInput("./tests/videos/concat.txt", { f: "concat" });
   * ```
   */
  public addInput(
    input: string,
    options?: Record<string, string | undefined>,
  ): this;

  /** ### Add a input
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   * const binaryData = await Deno.readFile("file.mp4");
   *
   * ffmpeg.addInput(binaryData);
   * ```
   */
  public addInput(
    input: Uint8Array,
    options?: Record<string, string | undefined>,
  ): this;

  public addInput(
    input: string | Uint8Array,
    options: Record<string, string | undefined> = {},
  ): this {
    if (input instanceof Uint8Array) {
      this.#input.push("pipe:0");
      this.#pipedInput = new Uint8Array([...this.#pipedInput, ...input]);
    } else {
      this.#input.push(input);
    }
    this.#inputOptions.push(options);
    return this;
  }

  /** ### Disable audio
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.noAudio();
   * ```
   */
  public noAudio(): this {
    this.#noAudio = true;
    return this;
  }

  /** ### Disable video
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.noVideo();
   * ```
   */
  public noVideo(): this {
    this.#noVideo = true;
    return this;
  }

  /** ### Set the frame height
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.setHeight(720);
   * ffmpeg.setHeight(-1); // Auto scales to aspect ratio
   * ```
   */
  public setHeight(height: number): this {
    this.#height = height;
    return this;
  }

  /** ### Set the frame width
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.setWidth(720);
   * ffmpeg.setWidth(-1); // Auto scales to aspect ratio
   * ```
   */
  public setWidth(width: number): this {
    this.#width = width;
    return this;
  }

  /** ### Set the audio codec
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.audioCodec("libmp3lame");
   * ```
   */
  public audioCodec(
    codec: string,
    options: Record<string, string | number | undefined> = {},
  ): this {
    this.#audioCodec = ["-c:a", codec];
    formatter.optionsFormatter(this.#audioCodec, options);
    return this;
  }

  /** ### Set the video codec
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.videoCodec("libx264");
   * ```
   */
  public videoCodec(
    codec: string,
    options: Record<string, string | undefined> = {},
  ): this {
    this.#videoCodec = ["-c:v", codec];
    formatter.optionsFormatter(this.#videoCodec, options);
    return this;
  }

  /** ### Set the audio bitrate in kbps
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.audioBitrate(128);
   * ```
   */
  public audioBitrate(bitrate: number): this {
    this.#audioBitrate = bitrate * 1024;
    this.#audioBitrateOptions = ["-b:a", String(bitrate * 1024)];
    return this;
  }

  /** ### Set the video bitrate in kbps or mbps
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.videoBitrate("10m"); // 10 mbps with cbr enabled
   * ffmpeg.videoBitrate("1000k"); // 1000 kbps with cbr enabled
   * ffmpeg.videoBitrate("1000k", true); // 1000 kbps with cbr enabled
   * ffmpeg.videoBitrate("1000k", false); // 1000 kbps with vbr enabled
   * ```
   */
  public videoBitrate(bitrate: string, cbr = true): this {
    this.#videoBitrate = parseInt(bitrate);
    let lastChar = bitrate.charAt(bitrate.length - 1).toLowerCase();
    if (lastChar !== "m" && lastChar !== "k") {
      lastChar = "k";
    }
    if (cbr) {
      this.#videoBitrateOptions = [
        "-maxrate",
        bitrate,
        "-minrate",
        bitrate,
        "-b:v",
        bitrate,
        "-bufsize",
        "3M",
      ];
    } else {
      this.#videoBitrateOptions = [
        "-maxrate",
        (parseFloat(bitrate) * 2 + lastChar).toString(),
        "-minrate",
        (parseFloat(bitrate) / 3).toString(),
        "-b:v",
        bitrate,
        "-bufsize",
        (parseFloat(bitrate) * 4).toString(),
      ];
    }
    return this;
  }

  /** ### Set audio filters
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.audioFilters(
   *     {
   *       filterName: "afade",
   *       options: {
   *         t: "in",
   *         ss: 0,
   *         d: 15,
   *       },
   *     },
   *     {
   *       filterName: "afade",
   *       options: {
   *         t: "out",
   *         ss: 0,
   *         d: 15,
   *       },
   *     },
   * );
   *
   * ```
   */
  public audioFilters(...filters: Filters[]): this {
    this.#audioFilter = formatter.filterFormatter(filters);
    return this;
  }

  /** ### Set complex filters
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.complexFilters(
   *     {
   *       filterName: "overlay",
   *       options: {
   *         x: "150",
   *       },
   *     },
   * );
   *
   * ```
   */
  public complexFilters(...Filters: Filters[]): this {
    this.#complexFilter = formatter.filterFormatter(Filters);
    return this;
  }

  /** ### Set video filters
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.videoFilters(
   *     {
   *       filterName: "drawtext",
   *       options: {
   *         text: "thingy",
   *         fontsize: "60",
   *         x: (856 / 2 - 30 * "thingy".length / 2),
   *         y: "H-240",
   *         fontcolor: "white",
   *         shadowcolor: "black",
   *         shadowx: "2",
   *         shadowy: "2",
   *       },
   *     },
   * );
   *
   * ```
   */
  public videoFilters(...Filters: Filters[]): this {
    this.#videoFilter = formatter.filterFormatter(Filters);
    return this;
  }

  /** ### Set output framerate
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * ffmpeg.outputFPS(60);
   */
  public outputFPS(fps: number): this {
    this.#outputFPS = fps;
    return this;
  }

  /** ### Start render and get Uint8Array
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * const data = await ffmpeg.save("pipe:1");
   * ```
   */
  public async save(
    output: "pipe:1",
    iterator?: false,
    options?: Record<string, string | number | undefined>,
  ): Promise<Uint8Array>;

  /** ### Start render and save to disk
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * await ffmpeg.save("outputfile.mp4");
   * ```
   */
  public async save(
    output: string,
    iterator?: false,
    options?: Record<string, string | number | undefined>,
  ): Promise<void>;

  /**
   * # NOT SUPPORTED!
   */
  public async save(
    output: "pipe:1",
    iterator?: true,
    options?: Record<string, string | number | undefined>,
  ): Promise<AsyncGenerator<Progress>>;

  /** ### Start render with iterator
   * #### Example
   * ```ts
   * import { FfmpegClass } from "../mod.ts"
   *
   * const ffmpeg = new FfmpegClass();
   *
   * const iterator = await ffmpeg.save("outputfile.mp4", true);
   *
   * for await (const iter of iterator) {
   *     console.log(iter.percentage)
   * }
   * ```
   */
  public async save(
    output: string,
    iterator?: true,
    options?: Record<string, string | number | undefined>,
  ): Promise<AsyncGenerator<Progress>>;

  /**
   * # If you see this overload, you will probably get an error
   */
  public async save(
    output: string | "pipe:1",
    iterator = false,
    options: Record<string, string | number | undefined> = {},
  ): Promise<void | Uint8Array | AsyncGenerator<Progress>> {
    this.#outputFile = output;
    this.#pipedOutput = output === "pipe:1";
    formatter.optionsFormatter(
      this.#outputOptions,
      options,
    );

    this.__errorCheck();
    this.#Process = Deno.run({
      cmd: this.__formatting(),
      stdin: this.#pipedInput.length > 0 ? "piped" : "null",
      stderr: "piped",
      stdout: this.#pipedOutput ? "piped" : "null",
    });

    if ((this.#pipedInput.length > 0 || this.#pipedOutput) && iterator) {
      throw new FfmpegError(
        "Cannot use iterator and piped stream\nThis will result in a deadlock",
      );
    }
    if (this.#pipedInput.length > 0) {
      await writeAll(this.#Process.stdin!, this.#pipedInput);
      this.#Process.stdin?.close();
    }
    return !iterator ? this.__closeProcess(false) : this.__getProgress();
  }

  private async *__getProgress(): AsyncGenerator<Progress> {
    let i = 1;
    let stderrStart = true;
    let timeS = 0;
    let totalFrames = 0;
    let encFound = 0;
    let currentFrame = 0;
    let currentFPS = 0;
    for await (const line of readLines(this.#Process.stderr!)) {
      if (line.includes("encoder")) encFound++;
      if (stderrStart === true) {
        this.#stderr.push(line);
        if (line.includes("Duration: ")) {
          const dur: string = line.trim().replaceAll("Duration: ", "");
          const timeArr: string[] = dur.substr(0, dur.indexOf(",")).split(":");
          timeS = (parseFloat(timeArr[0]) * 60 + parseFloat(timeArr[1])) * 60 +
            parseFloat(timeArr[2]);
        }
        if (this.#outputFPS > 0) {
          totalFrames = Math.floor(timeS * this.#outputFPS);
        } else if (
          line.includes("SAR") && line.includes("fps") &&
          line.includes("tbr") && line.includes("tbn")
        ) {
          const string: string = line.trim();
          totalFrames = Math.floor(
            timeS *
              parseFloat(
                string.substr(
                  string.indexOf("kb/s,"),
                  string.indexOf("fps") - string.indexOf("kb/s,"),
                ).replaceAll("kb/s,", "").trim(),
              ),
          );
          if (isNaN(totalFrames)) {
            totalFrames = Math.floor(
              timeS *
                parseFloat(
                  string.substr(
                    string.indexOf("],"),
                    string.indexOf("fps") - string.indexOf("],"),
                  ).replaceAll("],", "").trim(),
                ),
            );
          }
        }

        if (line.includes("encoder") && encFound > 2) {
          i = 0;
          stderrStart = false;
        }
      } else {
        if (line === "progress=end") break;
        if (line.includes("frame=")) {
          currentFrame = parseInt(line.replaceAll("frame=", "").trim());
        }
        if (line.includes("fps=")) {
          currentFPS = parseFloat(line.replaceAll("fps=", "").trim());
          if (currentFPS === 0) currentFPS = currentFrame;
        }
        if (i == 12) {
          const progressOBJ: Progress = {
            ETA: new Date(
              Date.now() + (totalFrames - currentFrame) / currentFPS * 1000,
            ),
            percentage: parseFloat(
              (currentFrame / totalFrames * 100).toFixed(2),
            ),
          };
          if (
            !isNaN(totalFrames) && !isNaN(currentFrame) && !isNaN(currentFPS) &&
            currentFPS !== 0 && progressOBJ.percentage < 100
          ) {
            yield progressOBJ;
          } else if (
            currentFPS !== 0 && totalFrames > currentFrame &&
            progressOBJ.percentage < 100
          ) {
            internalWarning(
              `Progress yield is invalid because one of the following values is NaN\ntotalFrames:${totalFrames}\ncurrentFrame:${currentFrame}\ncurrentFPS:${currentFPS}`,
            );
          }
          i = 0;
        }
      }
      i++;
    }
    const finalIter: Progress = {
      ETA: new Date(),
      percentage: 100,
    };

    yield finalIter;
    await this.__closeProcess(true);
    return;
  }

  private __clear(input: "audio" | "video"): void {
    if (input === "audio") {
      if (this.#audioBitrate !== 0) {
        warning(
          "Video bitrate was selected while no audio mode was selected!\nPlease remove video bitrate",
        );
      }

      if (this.#audioCodec.length > 0) {
        warning(
          "Video codec was selected while no audio mode was selected!\nPlease remove video codec",
        );
      }

      this.#audioCodec = [];
      this.#audioBitrate = 0;
      this.#audioBitrateOptions = [];
      this.#audioFilter = [];
    } else {
      if (this.#videoFilter.length > 0) {
        warning(
          "Video Filters was selected while no video mode was selected!\nPlease remove video filters",
        );
      }

      if (this.#videoBitrate !== 0) {
        warning(
          "Video bitrate was selected while no video mode was selected!\nPlease remove video bitrate",
        );
      }

      if (this.#videoCodec.length > 0) {
        warning(
          "video codec was selected while no video mode was selected!\nPlease remove video codec",
        );
      }
      this.#videoCodec = [];
      this.#videoBitrate = 0;
      this.#videoBitrateOptions = [];
      this.#videoFilter = [];
      this.#height = -1;
      this.#width = -1;
      this.#outputFPS = 0;
    }
    return;
  }

  private __formatting(): string[] {
    const thing: Globals = {
      ffmpegdir: this.#ffmpegDir,
      niceness: this.#niceness,
      threads: this.#threadCount,
      ...this.#globals,
    };
    let temp = formatter.globalOptionsFormatter(thing);

    for (let i = 0; i < this.#input.length; i++) {
      if (this.#inputOptions[i]) {
        formatter.optionsFormatter(temp, this.#inputOptions[i]);
      }
      temp.push("-i", this.#input[i]);
    }
    if (this.#noAudio) {
      temp.push("-an");
      this.__clear("audio");
    }

    if (this.#noVideo) {
      temp.push("-vn");
      this.__clear("video");
    }

    if (this.#audioCodec.length > 0) temp = temp.concat(this.#audioCodec);
    if (this.#videoCodec.length > 0) temp = temp.concat(this.#videoCodec);

    if (this.#height !== -1 || this.#width !== -1) {
      this.#videoFilter.push(`scale=${this.#width}:${this.#height}`);
    }

    if (this.#audioFilter.length > 0) {
      temp.push("-af", this.#audioFilter.join(","));
    }
    if (this.#videoFilter.length > 0) {
      temp.push("-vf", this.#videoFilter.join(","));
    }
    if (this.#complexFilter.length > 0) {
      temp.push("-filter_complex", this.#complexFilter.join(","));
    }

    if (this.#audioBitrateOptions.length > 0) {
      temp = temp.concat(this.#audioBitrateOptions);
    }
    if (this.#videoBitrateOptions.length > 0) {
      temp = temp.concat(this.#videoBitrateOptions);
    }
    if (this.#outputFPS > 0) temp.push("-r", this.#outputFPS.toString());
    if (this.#outputOptions.length > 0) temp = temp.concat(this.#outputOptions);
    temp.push("-progress", "pipe:2", this.#outputFile);
    return temp;
  }

  private __errorCheck(): void {
    const errors: string[] = [];
    if (this.#outputFPS > 0 && isNaN(this.#outputFPS)) {
      errors.push("FPS is NaN");
    }

    if (this.#threadCount > 0 && isNaN(this.#threadCount)) {
      errors.push("Amount of threads is NaN");
    }

    if (
      this.#audioCodec.length > 0 &&
      (this.#audioCodec.join("").includes("undefined") ||
        this.#audioCodec.includes("null"))
    ) {
      errors.push("One or more audio codec options are undefined");
    }

    if (
      this.#videoCodec.length > 0 &&
      (this.#videoCodec.join("").includes("undefined") ||
        this.#videoCodec.includes("null"))
    ) {
      errors.push("One or more video codec options are undefined");
    }

    if (
      this.#videoBitrateOptions.length > 0 &&
      (this.#videoBitrate === 0 || isNaN(this.#videoBitrate))
    ) {
      errors.push("Video bitrate is NaN");
    }

    if (
      this.#audioBitrateOptions.length > 0 &&
      (this.#audioBitrate === 0 || isNaN(this.#audioBitrate))
    ) {
      errors.push("Audio bitrate is NaN");
    }

    if (this.#input.length === 0) {
      errors.push("No input specified!");
    }

    if ((!this.#outputFile || this.#outputFile == "")) {
      errors.push("No output specified!");
    }

    if (!this.#ffmpegDir || this.#ffmpegDir == "") {
      errors.push("No ffmpeg directory specified!");
    }

    if (this.#videoFilter.length > 0 && this.#complexFilter.length > 0) {
      errors.push("Simple & Complex filters cannot be used at the same time");
    }
    if (this.#width % 2 !== 0 && this.#width !== -1) {
      errors.push("Width is not divisible by 2");
    }
    if (this.#height % 2 !== 0 && this.#height !== -1) {
      errors.push("Height is not divisible by 2");
    }
    if (
      this.#complexFilter.length > 0 &&
      this.#complexFilter.join("").includes("undefined")
    ) {
      errors.push(
        "Complex Filter(s) were selected, but the field is incorrect or empty",
      );
    }

    if (
      this.#videoFilter.length > 0 &&
      this.#videoFilter.join("").includes("undefined")
    ) {
      errors.push(
        "Video Filter(s) were selected, but the field is incorrect or empty",
      );
    }

    if (
      this.#audioFilter.length > 0 &&
      this.#audioFilter.join("").includes("undefined")
    ) {
      errors.push(
        "Audio Filter(s) were selected, but the field is incorrect or empty",
      );
    }

    if (errors.length > 0) {
      const errorList: string = errors.join("\n");
      throw new FormatError(errorList);
    }
    return;
  }

  private async __closeProcess(
    hasProgress: boolean,
  ): Promise<void | Uint8Array> {
    let stderr = this.#stderr.join("");
    let buff: Uint8Array = new Uint8Array();
    if (this.#pipedOutput && !hasProgress) {
      buff = await this.#Process.output();
    }
    if (!hasProgress) {
      stderr = new TextDecoder().decode(await this.#Process.stderrOutput());
    } else {
      this.#Process.stderr!.close();
    }
    const status = await this.#Process.status();
    this.#Process.close();
    if (!status.success) throw new FfmpegError(stderr);
    if (this.#pipedOutput && !hasProgress && buff) return buff;
    return;
  }
}

/** ### Create a new instance of FfmpegClass. This does the same as `new FfmpegClass()`
 * #### Example
 * ```ts
 * import { ffmpeg } from "../mod.ts"
 *
 * const instance = ffmpeg();
 * ```
 */
export function ffmpeg(options?: Spawn): FfmpegClass {
  return new FfmpegClass(options);
}
