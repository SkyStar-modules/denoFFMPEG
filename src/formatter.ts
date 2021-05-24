import type { Filters, Globals } from "./types.ts";

export function optionsFormatter(
  mutArray: string[],
  options: Record<string, string | number | undefined>,
): void {
  for (const [key, value] of Object.entries(options)) {
    mutArray.push("-" + key);
    if (value) mutArray.push(value.toString());
  }
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

export function filterFormatter(filters: Filters[]): string[] {
  const filterArr: string[] = [];
  for (const filter of filters) {
    let temp: string = filter.filterName + "=";
    Object.entries(filter.options).forEach(([key, value], i) =>
      temp += ((i > 0) ? ": " : "") + `${key}=${value}`
    );
    filterArr.push(temp);
  }

  return filterArr;
}
