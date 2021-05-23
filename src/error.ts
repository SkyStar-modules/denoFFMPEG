export function warning(str: string): void {
  return console.warn("\x1b[33mWARNING:\x1b[0m " + str);
}

export function internalWarning(str: string): void {
  return console.warn("\x1b[33mINTERNAL WARNING:\x1b[0m " + str);
}

export class InternalError extends Error {
  name = "\x1b[31mINTERNAL ERROR:\x1b[0m";
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}

export class FfmpegError extends Error {
  name = "\x1b[31mRENDER DIDN'T FINISH:\x1b[0m";
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}

export class FormatError extends Error {
  name = "\x1b[31mFormatting Error:\x1b[0m";
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}
