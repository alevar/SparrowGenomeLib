import * as d3 from "d3";
import { Dimensions, BedData } from '../../types';
interface LinePlotData {
    dimensions: Dimensions;
    bedData: BedData;
    color: string;
    xScale: d3.ScaleLinear<number, number>;
    yScale?: d3.ScaleLinear<number, number>;
}
export declare class LinePlot {
    private svg;
    private dimensions;
    private bedData;
    private xScale;
    private yScale;
    private useProvidedYScale;
    private color;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: LinePlotData);
    get_yScale(): d3.ScaleLinear<number, number>;
    plot(): void;
}
export {};
//# sourceMappingURL=LinePlot.d.ts.map