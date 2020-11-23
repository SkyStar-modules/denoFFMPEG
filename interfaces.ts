export interface Filters {
    filterName: string,
    options: Object,
    custom: string
}

export interface Spawn {
    ffmpegDir: string,
    input: string,
    fatalError?: boolean
}