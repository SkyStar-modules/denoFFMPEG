import { Filters, Globals, Progress, ProgressPiped, Spawn } from "./types.ts";
import {
  FfmpegError,
  FormatError,
  InternalError,
  internalWarning,
  warning,
} from "./error.ts";
import { readLines } from "../deps.ts";
import * as formatter from "./formatter.ts";

/**
* Public Class for ffmpeg rendering
*/
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
  #firstInputIsURL = false;
  #pipedOutput = false;
  #pipedInput: Uint8Array = new Uint8Array();
  #Process!: Deno.Process;

  /**
  Make new ffmpeg instance.
  @param { Spawn } options - Spawn options
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
            if (value.includes("http") && this.#input.length == 0) {
              this.#firstInputIsURL = true;
            }
            this.#input.push(value);
            this.#inputOptions.push({});
            break;
          default:
            warning(`option '${value}' not found! Please remove it`);
        }
      }
    }
    return this;
  }

  /**
  Set path to the ffmpeg binary file
  @param { string } ffmpegPath
  */
  public setFfmpegPath(ffmpegPath: string): this {
    if (ffmpegPath) {
      if (this.#ffmpegDir.length > 0 && this.#ffmpegDir !== "ffmpeg") {
        warning(
          "changing ffmpeg path from " + this.#ffmpegDir + " to " + ffmpegPath,
        );
      }
      this.#ffmpegDir = ffmpegPath;
    }
    return this;
  }

  /**
  Set amount of threads
  @param { number } amount - Amount of threads to use
  */
  public threads(amount: number): this {
    this.#threadCount = amount;
    return this;
  }

  /**
  Set path to the inputfile
  @param { string } input - input file
  @param { Record<string, string | undefined> } options - Options for input
  */
  public addInput(
    input: string,
    options?: Record<string, string | undefined>,
  ): this;
  /**
  Set path to the inputfile
  @param { Uint8Array } input - input data for pipes
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
      if (input.includes("http") && this.#input.length === 0) {
        this.#firstInputIsURL = true;
      }
      this.#input.push(input);
    }
    this.#inputOptions.push(options);
    return this;
  }

  /**
  Disable Audio and remove all audio settings
  */
  public noAudio(): this {
    this.#noAudio = true;
    return this;
  }

  /**
  Disable video and remove all video settings
  */
  public noVideo(): this {
    this.#noVideo = true;
    return this;
  }

  /**
  Set height of the video
  @param { number } height - height of the output
  */
  public setHeight(height: number): this {
    this.#height = height;
    return this;
  }

  /**
  Set width of the video
  @param { number } width - width of the output
  */
  public setWidth(width: number): this {
    this.#width = width;
    return this;
  }

  /**
  Set audio codec
  @param { string } codec - codec to use for encoding audio
  @param { Record<string, string | number | undefined> } options - options to use with codec (usually not used)
  */
  public audioCodec(
    codec: string,
    options: Record<string, string | number | undefined> = {},
  ): this {
    this.#audioCodec = ["-c:a", codec];
    formatter.optionsFormatter(this.#audioCodec, options);
    return this;
  }

  /**
  Set video codec
  @param { string } codec - codec to use for encoding video
  @param { Record<string, string | undefined> } options - options to use with codec (usually not used)
  */
  public videoCodec(
    codec: string,
    options: Record<string, string | undefined> = {},
  ): this {
    this.#videoCodec = ["-c:v", codec];
    formatter.optionsFormatter(this.#videoCodec, options);
    return this;
  }

  /**
  Set audio bitrate in kbps
  @param { number } bitrate - audio bitrate to use
  */
  public audioBitrate(bitrate: number): this {
    this.#audioBitrate = bitrate * 1024;
    this.#audioBitrateOptions = ["-b:a", String(bitrate * 1024)];
    return this;
  }

  /**
  Set video bitrate in mbps or kbps
  @param { number | string } bitrate - bitrate use bitrate you want in mbps(15m) or kbps(15000k)
  @param cbr - enable constant bitrate (default = true)
  */
  public videoBitrate(bitrate: number | string, cbr = true): this {
    const brString = String(bitrate);
    this.#videoBitrate = parseInt(brString);
    let lastChar = brString.charAt(brString.length - 1).toLowerCase();
    if (lastChar !== "m" && lastChar !== "k") {
      lastChar = "k";
    }
    if (cbr) {
      this.#videoBitrateOptions = [
        "-maxrate",
        brString,
        "-minrate",
        brString,
        "-b:v",
        brString,
        "-bufsize",
        "3M",
      ];
    } else {
      this.#videoBitrateOptions = [
        "-maxrate",
        (parseFloat(brString) * 2 + lastChar).toString(),
        "-minrate",
        (parseFloat(brString) / 3).toString(),
        "-b:v",
        brString.toString(),
        "-bufsize",
        (parseFloat(brString) * 4).toString(),
      ];
    }
    return this;
  }

  /**
  Set audio filters
  @param { Filters[] } fiters - Filters Array of filter Objects you want to use for processing
  */
  public audioFilters(...filters: Filters[]): this {
    this.#audioFilter = formatter.filterFormatter(filters);
    return this;
  }

  /**
  Set video filters
  @param { Filters[] } Filters - Filters Array of filter Objects you want to use for processing
  */
  public complexFilters(...Filters: Filters[]): this {
    this.#complexFilter = formatter.filterFormatter(Filters);
    return this;
  }

  /**
  Set video filters
  @param { Filters[] } Filters - Filters Array of filter Objects you want to use for processing
  */
  public videoFilters(...Filters: Filters[]): this {
    this.#videoFilter = formatter.filterFormatter(Filters);
    return this;
  }

  /**
  Set output fps
  @param { number } fps - framerate you want to use
  */
  public outputFPS(fps: number): this {
    this.#outputFPS = fps;
    return this;
  }

  /**
  Set output path and encode input. will return once the render is finished
  @param { string } output - output path
  */
  public save(
    output: "pipe:1",
    iterator?: false,
    options?: Record<string, string | number | undefined>,
  ): Promise<Uint8Array>;

  /**
  Set output path and encode input. will return once the render is finished
  @param { string } output - output path
  */
  public save(
    output: string,
    iterator?: false,
    options?: Record<string, string | number | undefined>,
  ): Promise<void>;

  /**
  Set output path and encode input. will return once the render is finished
  */
  public save(
    output: string,
    iterator?: true,
    options?: Record<string, string | number | undefined>,
  ): AsyncGenerator<Progress>;

  /**
  Set output path and encode input. will return once the render is finished
  @param { string } output - output path
  */
  public save(
    output: string | "pipe:1",
    iterator = false,
    options: Record<string, string | number | undefined> = {},
  ): Promise<void | Uint8Array> | AsyncGenerator<Progress> {
    this.#outputFile = output;
    this.#pipedOutput = output === "pipe:1";
    formatter.optionsFormatter(
      this.#outputOptions,
      options,
    );

    this.__errorCheck();
    this.#Process = Deno.run({
      cmd: this.__formatting(),
      stderr: "piped",
      stdout: this.#pipedOutput ? "piped" : "null",
    });

    if (this.#pipedOutput && iterator) {
      throw new FfmpegError(
        "Cannot use iterator and piped stream\nThis will result in a deadlock",
      );
    }

    return !iterator ? this.__closeProcess(false) : this.__getProgress();
  }

  /**
  Get the progress of the ffmpeg instancegenerator
  @returns { AsyncGenerator<Progress> } - Returns async iterable
  */
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
          timeS = ((parseFloat(timeArr[0]) * 60 + parseFloat(timeArr[1])) * 60 +
            parseFloat(timeArr[2]));
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
              `progress yield is invalid because one of the following values is NaN\ntotalFrames:${totalFrames}\ncurrentFrame:${currentFrame}\ncurrentFPS:${currentFPS}`,
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
    if (this.#pipedOutput) {
      (finalIter as ProgressPiped).pipedData = await this.#Process.output();
    }
    yield finalIter;
    await this.__closeProcess(true);
    return;
  }

  /**
  Clear all filters and everything for audio or video
  */
  private __clear(input: string): void {
    if (input.toLowerCase() === "audio") {
      if (this.#audioBitrate !== 0) {
        warning(
          "video bitrate was selected while no audio mode was selected!\nPlease remove video bitrate",
        );
      }

      if (this.#audioCodec.length > 0) {
        warning(
          "video codec was selected while no audio mode was selected!\nPlease remove video codec",
        );
      }

      this.#audioCodec = [];
      this.#audioBitrate = 0;
      this.#audioBitrateOptions = [];
      this.#audioFilter = [];
    } else if (input.toLowerCase() === "video") {
      if (this.#videoFilter.length > 0) {
        warning(
          "video Filters was selected while no video mode was selected!\nPlease remove video filters",
        );
      }

      if (this.#videoBitrate !== 0) {
        warning(
          "video bitrate was selected while no video mode was selected!\nPlease remove video bitrate",
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
    } else {
      throw new InternalError(
        "tried to clear input. But invalid input was specified!",
      );
    }
    return;
  }

  /**
  Format & process all data to run ffmpeg
  */
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

  /**
  Check's for common error's made by the user
  */
  private __errorCheck(): void {
    const errors: string[] = [];
    if (this.#outputFPS > 0 && isNaN(this.#outputFPS)) {
      errors.push("FPS is NaN");
    }

    if (this.#threadCount > 0 && isNaN(this.#threadCount)) {
      errors.push("amount of threads is NaN");
    }

    if (
      this.#audioCodec.length > 0 &&
      (this.#audioCodec.join("").includes("undefined") ||
        this.#audioCodec.includes("null"))
    ) {
      errors.push("one or more audio codec options are undefined");
    }

    if (
      this.#videoCodec.length > 0 &&
      (this.#videoCodec.join("").includes("undefined") ||
        this.#videoCodec.includes("null"))
    ) {
      errors.push("one or more video codec options are undefined");
    }

    if (
      this.#videoBitrateOptions.length > 0 &&
      (this.#videoBitrate === 0 || isNaN(this.#videoBitrate))
    ) {
      errors.push("video Bitrate is NaN");
    }

    if (
      this.#audioBitrateOptions.length > 0 &&
      (this.#audioBitrate === 0 || isNaN(this.#audioBitrate))
    ) {
      errors.push("audio Bitrate is NaN");
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
      errors.push("height is not divisible by 2");
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
        "Simple video Filter(s) were selected, but the field is incorrect or empty",
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

  /**
  Wait method for run
  */
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

export function ffmpeg(options?: Spawn): FfmpegClass {
  return new FfmpegClass(options);
}
