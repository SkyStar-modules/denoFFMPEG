import {Filters} from "./types.ts";
export function codecFormatter(codecType: string, codec: string, options?: Record<string, string|number>): string[] {
    let codecArr: string[] = [codecType, codec];
    if (codec == "" || codec == "null" || codec == "undefined") {
        codecArr = [codecType, "undefined"];
    }
    if (options) {
        Object.entries(options).forEach(x => {
            codecArr.push("-" + x[0], String(x[1]));
        });
    }
    return codecArr;
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