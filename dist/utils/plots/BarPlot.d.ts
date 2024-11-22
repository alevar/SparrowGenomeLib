import * as d3 from "d3";
import { Dimensions, BedData } from '../../types';
interface BarPlotData {
    dimensions: Dimensions;
    xScale: d3.ScaleLinear<number, number>;
    bedData: BedData;
    color: string;
    yScale?: d3.ScaleLinear<number, number>;
}
export declare class BarPlot {
    private svg;
    private dimensions;
    private bedData;
    private xScale;
    private yScale;
    private useProvidedYScale;
    private color;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: BarPlotData);
    get_yScale(): d3.ScaleLinear<number, number>;
    plot(): void;
}
export {};
//# sourceMappingURL=BarPlot.d.ts.map