export function warning(str: string): void {
  return console.warn("\x1b[0;33;40mWARNING:\x1b[39m " + str);
}

export function internalWarning(str: string): void {
  return console.warn("\x1b[0;33;40mINTERNAL WARNING:\x1b[39m " + str);
}

export class InternalError extends Error {
  name = "\x1b[0;31;40mINTERNAL ERROR:\x1b[39m";
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}

export class FfmpegError extends Error {
  name = "\x1b[0;31;40mRENDER DIDN'T FINISH:\x1b[39m";
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}

export class FormatError extends Error {
  name = "\x1b[0;31;40mFormatting Error:\x1b[39m";
  constructor(errorMessage: string) {
    super(errorMessage);
  }
}
