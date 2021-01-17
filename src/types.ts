export interface Filters {
    complex?: boolean;
    filterName: string;
    options: Record<string, string|number>;
}
export interface Spawn {
    ffmpegDir?: string;
    niceness?: number|string;
    input?: string;
}
export interface Progress {
    ETA: Date;
    percentage: number;
}