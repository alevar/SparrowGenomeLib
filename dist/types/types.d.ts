export interface BedLine {
    seqid: string;
    start: number;
    end: number;
    name: string;
    score: number;
    strand: string;
}
export declare class BedData {
    private data;
    constructor();
    addLine(line: BedLine): void;
    get length(): number;
    sort(): void;
    numEntries(): number;
    maxScore(): number;
    getData(): BedLine[];
    getPos(pos: number): BedLine[];
    getRange(start: number, end: number): BedData;
    explode(): BedData;
}
export interface BedFile {
    data: BedData;
    fileName: string;
    status: 1 | 0 | -1;
}
export type Interval = [number, number];
export interface Dimensions {
    width: number;
    height: number;
    x: number;
    y: number;
    fontSize: number;
}
//# sourceMappingURL=types.d.ts.map