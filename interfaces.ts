interface AvgBlur {
    sizeX: string|number,
    sizeY: string|number,
    planes: string
}
interface DrawText {
    fontfile: string,
    fontcolor: string,
    fontsize: number|string,
    x: number|string,
    y: number|string,
    shadowcolor: string,
    shadowx: string|number,
    shadowy: string|number,
    text: string
}
interface Yadif {
    mode: number,
    parity: number,
    deint: number
}
export interface Filters {
    filterName: string,
    options: DrawText&Yadif&AvgBlur
    custom: string
}