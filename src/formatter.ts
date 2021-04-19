import { Filters, Globals } from "./types.ts";
export function optionsFormatter(
  mutArray: string[],
  options: Record<string, string | number>,
): void {
  const optArray = Object.entries(options);

  optArray.forEach(([key, value]) => {
    mutArray.push("-" + key, value.toString());
  });
  return;
}

export function globalOptionsFormatter(globals: Globals): string[] {
  const temp: string[] = [globals.ffmpegdir, "-hide_banner", "-nostats", "-y"];

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
  filters.forEach((x: Filters) => {
    let temp: string = x.filterName + "=";
    Object.entries(x.options).forEach(
      ([key, value], i: number) => {
        temp += (i > 0) ? `: ${key}=${value}` : `${key}=${value}`;
      },
    );

    filterArr.push(temp);
  });

  return filterArr;
}
