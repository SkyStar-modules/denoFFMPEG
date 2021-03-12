import { Processing } from "./processorClass.ts";
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
  * 
  * Parameter 1: ffmpegDir path to the ffmpeg binary
  * 
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
     */
  public setHeight(h: number): this {
    this.height = h;
    return this;
  }

  /**
     * Set width of the video
     */
  public setWidth(w: number): this {
    this.width = w;
    return this;
  }

  /**
     * Set audio codec
     * 
     * Parameter 1: codec Audio Codec name  
     * Parameter 2: options options object for codec supported options
     *
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
     * 
     * Parameter 1: codec video Codec name  
     * Parameter 2: options Options object for codec supported options
     *
     */
  public videoCodec(codec: string, options?: Record<string, string>): this {
    this.vidCodec = formatter.codecFormatter("-c:v", codec, options);
    return this;
  }

  /**
     * Set audio bitrate in kbps
     * 
     * Parameter 1: bitrate use bitrate you want in kbps
     * 
     */
  public audioBitrate(bitrate: number): this {
    this.aBR = bitrate * 1024;
    this.abitrate = ["-b:a", String(bitrate * 1024)];
    return this;
  }

  /**
     * Set video bitrate in mbps or kbps
     * 
     * Parameter 1: bitrate use bitrate you want in mbps(15m) or kbps(15000k)  
     * Parameter 2: cbr enable constant bitrate (default = true)
     * 
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
     * Set video filters
     * 
     * Parameter 1: Filters Array of filter Objects you want to use for processing
     * 
     */
  public audioFilters(...Filters: Filters[]): this {
    this.audioFilter = formatter.filterFormatter(...Filters);
    return this;
  }
  /**
     * Set video filters
     * 
     * Parameter 1: Filters Array of filter Objects you want to use for processing
     * 
     */
  public complexFilters(...Filters: Filters[]): this {
    this.complexFilter = formatter.filterFormatter(...Filters);
    return this;
  }

  /**
     * Set video filters
     * 
     * Parameter 1: Filters Array of filter Objects you want to use for processing
     * 
     */
  public videoFilters(...Filters: Filters[]): this {
    this.simpleVideoFilter = formatter.filterFormatter(...Filters);
    return this;
  }

  /**
     * Set output fps
     * 
     * parameter 1: set output fps
     * 
     */
  public outputFPS(fps: number): this {
    this.fps = fps;
    return this;
  }

  /**
     * set output path and encode
     * 
     * parameter 1: set output path
     * 
     * returns: void
     * 
     */
  public save(output: string): Promise<void> {
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
  public saveWithProgress(output: string): AsyncGenerator<Progress> {
    this.outputFile = output;
    return this.__runWithProgress();
  }
}

export function ffmpeg(options?: Spawn): FfmpegClass {
  return new FfmpegClass(options);
}
