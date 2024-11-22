export interface GridConfig {
    columns: number;
    columnRatios: number[];
    rowRatiosPerColumn: number[][];
}
export interface Padding {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export declare class D3Grid {
    private height;
    private width;
    private gridConfig;
    private svg;
    private cellDimensions_raw;
    private cellDimensions;
    private cellCoordinates;
    private cellData;
    private cellSvgs;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, height: number, width: number, gridConfig: GridConfig);
    private setupGrid;
    getCellData(colIndex: number, rowIndex: number): any;
    setCellData(colIndex: number, rowIndex: number, data: any): void;
    getSvg(): d3.Selection<SVGSVGElement, unknown, null, undefined>;
    getCellDimensions(colIndex: number, rowIndex: number): {
        width: number;
        height: number;
    } | undefined;
    getCellCoordinates_unpadded(colIndex: number, rowIndex: number): {
        x: number;
        y: number;
    } | undefined;
    getCellCoordinates(colIndex: number, rowIndex: number): {
        x: number;
        y: number;
    } | undefined;
    getCellSvg(colIndex: number, rowIndex: number): d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
    createOverlaySvg(colIndex: number, rowIndices: number[]): d3.Selection<SVGSVGElement, unknown, null, undefined>;
    promote(colIndex: number, rowIndex: number): void;
}
//# sourceMappingURL=plotGrid.d.ts.map