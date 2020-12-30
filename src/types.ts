export interface Filters {
    filterName: string;
    options: Record<string, unknown>;
}
export interface Spawn {
    ffmpegDir?: string;
    niceness?: number|string;
    source?: string;
}
export interface Progress {
    ETA: Date;
    percentage: number;
}