export interface Filters {
    complex?: boolean;
    filterName: string;
    options: Record<string, string|number>;
}
export interface Spawn {
    threads?: string|number
    ffmpegDir?: string;
    niceness?: number|string;
    input?: string;
}
export interface Progress {
    ETA: Date;
    percentage: number;
}
export interface Globals {
    ffmpegdir: string;
    niceness: string|number;
    threads: string|number;
}