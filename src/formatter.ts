import { Filters, Globals } from "./types.ts";
export function codecFormatter(codecType: string, codec: string, options?: Record<string, string|number>): string[] {
    codec = (codec == "" || codec == "null" || codec == "undefined") ? "undefined" : codec;
    const codecArr: string[] = [codecType, codec];

    if (options) {
        Object.entries(options).forEach(x => {
            codecArr.push("-" + x[0], x[1].toString());
        });
    }
    return codecArr;
}

export function globalOptionsFormatter(globals: Globals): string[] {
    const temp: string[] = ["","-hide_banner", "-nostats","-y"];
        temp[0] = !(globals.ffmpegdir == "" || !globals.ffmpegdir) ? globals.ffmpegdir : "ffmpeg";

    if (globals.niceness > 0) {
        temp.push("-n", globals.niceness.toString());
    }

    if (globals.threads > 0) {
        temp.push("-threads", globals.threads.toString());
    }

    return temp;
}

export function filterFormatter(...filters: Filters[]): string[] {
    const filterArr: string[] = [];
    filters.forEach(x => {
            let temp: string = x.filterName + '=';
            Object.entries(x.options).forEach((j, i) => {
                if (i > 0) {
                    temp += `: ${j[0]}=${j[1]}`;
                } else {
                    temp += `${j[0]}=${j[1]}`;
                }
            });

        filterArr.push(temp);
    });

    return filterArr;
}