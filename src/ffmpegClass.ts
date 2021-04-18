import { Processing } from "./processorClass.ts";
// deno-lint-ignore no-unused-vars
import { Filters, Progress, Spawn } from "./types.ts";
import * as logger from "./logger.ts";
import * as formatter from "./formatter.ts";

/**
* Public Class for ffmpeg rendering
*/
export class FfmpegClass extends Processing {
  /**
  * Make new ffmpeg instance.
  @param { Spawn } options - Spawn options
  */
  public constructor(options?: Spawn) {
    super();
    if (options) {
      Object.entries(options).forEach((j: Array<string | number>) => {
        const option = j[0].toString().toLowerCase();
        const value = j[1].toString();
        switch (option) {
          case "threads":
            this.threadCount = parseInt(value);
            break;
          case "ffmpegdir":
            this.ffmpegDir = value;
            break;
          case "niceness":
            if (Deno.build.os === "windows") {
              logger.warning(
                "Niceness is set while using windows\nPlease remove it because it is ignored",
              );
            } else {
              this.niceness = parseInt(value);
            }
            break;
          case "input":
            if (value.includes("http") && this.input.length == 0) {
              this.firstInputIsURL = true;
            }
            this.input.push(value);
            break;
          default:
            logger.warning("option '" + j[0] + "' not found! Please remove it");
        }
      });
    }
    return this;
  }

  /**
  * Set path to the ffmpeg binary file
  @param { string } ffmpegPath
  */
  public setFfmpegPath(ffmpegPath: string): this {
    if (ffmpegPath) {
      if (this.ffmpegDir.length > 0 && this.ffmpegDir !== "ffmpeg") {
        logger.warning(
          "changing ffmpeg path from " + this.ffmpegDir + " to " + ffmpegPath,
        );
      }
      this.ffmpegDir = ffmpegPath;
    }
    return this;
  }

  /**
  * Set amount of threads
  @param { number } amount - Amount of threads to use
  */
  public threads(amount: number): this {
    this.threadCount = amount;
    return this;
  }

  /**
  * Set path to the inputfile
  @param { string } input - input file
  */
  public addInput(input: string): this {
    if (input) {
      if (input.includes("http") && this.input.length === 0) {
        this.firstInputIsURL = true;
      }
      this.input.push(input);
    }
    return this;
  }

  /**
  * Disable Audio and remove all audio settings
  */
  public noAudio(): this {
    this.noaudio = true;
    return this;
  }

  /**
  * Disable video and remove all video settings
  */
  public noVideo(): this {
    this.novideo = true;
    return this;
  }

  /**
  * Set height of the video
  @param { number } height - height of the output
  */
  public setHeight(height: number): this {
    this.height = height;
    return this;
  }

  /**
  * Set width of the video
  @param { number } width - width of the output
  */
  public setWidth(width: number): this {
    this.width = width;
    return this;
  }

  /**
  * Set audio codec
  @param { string } codec - codec to use for encoding audio
  @param { Record<string, string | number> } options - options to use with codec (usually not used)
  */
  public audioCodec(
    codec: string,
    options?: Record<string, string | number>,
  ): this {
    this.audCodec = formatter.codecFormatter("-c:a", codec, options);
    return this;
  }

  /**
  * Set video codec
  @param { string } codec - codec to use for encoding video
  @param { Record<string, string> } options - options to use with codec (usually not used)
  */
  public videoCodec(codec: string, options?: Record<string, string>): this {
    this.vidCodec = formatter.codecFormatter("-c:v", codec, options);
    return this;
  }

  /**
  * Set audio bitrate in kbps
  @param { number } bitrate - audio bitrate to use
  */
  public audioBitrate(bitrate: number): this {
    this.aBR = bitrate * 1024;
    this.abitrate = ["-b:a", String(bitrate * 1024)];
    return this;
  }

  /**
  * Set video bitrate in mbps or kbps
  @param { number | string } bitrate - bitrate use bitrate you want in mbps(15m) or kbps(15000k)
  @param cbr - enable constant bitrate (default = true)
  */
  public videoBitrate(bitrate: number | string, cbr = true): this {
    const brString = String(bitrate);
    this.vBR = parseInt(brString);
    let lastChar = brString.charAt(brString.length - 1).toLowerCase();
    if (lastChar !== "m" && lastChar !== "k") {
      lastChar = "k";
    }
    this.vbitrate = [
      "-maxrate",
      brString,
      "-minrate",
      brString,
      "-b:v",
      brString,
      "-bufsize",
      "3M",
    ];
    if (!cbr) {
      this.vbitrate = [
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
  * Set audio filters
  @param { Filters[] } Filters - Filters Array of filter Objects you want to use for processing
  */
  public audioFilters(...Filters: Filters[]): this {
    this.audioFilter = formatter.filterFormatter(...Filters);
    return this;
  }

  /**
  * Set video filters
  @param { Filters[] } Filters - Filters Array of filter Objects you want to use for processing
  */
  public complexFilters(...Filters: Filters[]): this {
    this.complexFilter = formatter.filterFormatter(...Filters);
    return this;
  }

  /**
  * Set video filters
  @param { Filters[] } Filters - Filters Array of filter Objects you want to use for processing
  */
  public videoFilters(...Filters: Filters[]): this {
    this.simpleVideoFilter = formatter.filterFormatter(...Filters);
    return this;
  }

  /**
  * Set output fps
  @param { number } fps - framerate you want to use
  */
  public outputFPS(fps: number): this {
    this.fps = fps;
    return this;
  }

  /**
  * set output path and encode input. will return once the render is finished
  @param { string } output - output path
  */
  public save(output: string): Promise<void> {
    this.outputFile = output;
    return this.__run();
  }

  /**
  * set output path and encode input
  @param { string } output - output path
  @returns { AsyncGenerator<Progress> } - Returns async iterable
  */
  public saveWithProgress(output: string): AsyncGenerator<Progress> {
    this.outputFile = output;
    return this.__runWithProgress();
  }
}

export function ffmpeg(options?: Spawn): FfmpegClass {
  return new FfmpegClass(options);
}
