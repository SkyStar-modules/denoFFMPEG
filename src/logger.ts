export function warning(str: string): void {
    console.warn("\x1b[0;33;40mWARNING:\x1b[39m " + str);
}

export function internalWarning(str: string): void {
    console.warn("\x1b[0;33;40mINTERNAL WARNING:\x1b[39m " + str);
}

export function internalError(str: string): void {
    throw "\x1b[0;31;40mINTERNAL ERROR:\x1b[39m " + str;
}

export function ffmpegError(str: string): void {
    throw "\x1b[0;31;40mRENDER DIDN'T FINISH:\x1b[39m " + str;
}

export function formatError(str: string): void {
    throw "\x1b[0;31;40mFormatting Error:\x1b[39m " + str;
}