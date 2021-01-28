export interface Filters {
    complex?: boolean;
    filterName: string;
    options: Record<string, string|number>;
}
export interface Spawn {
    threads?: number;
    ffmpegDir?: string;
    niceness?: number;
    input?: string;
}
export interface Progress {
    ETA: Date;
    percentage: number;
}
export interface Globals {
    ffmpegdir: string;
    niceness: number;
    threads: number;
}