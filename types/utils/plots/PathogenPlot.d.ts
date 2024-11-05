import { Transcriptome, Dimensions } from "../../types";
interface PathogenPlotData {
    transcriptome: Transcriptome;
    dimensions: Dimensions;
}
export declare class PathogenPlot {
    private svg;
    private dimensions;
    private transcriptome;
    private gridConfig;
    private grid;
    constructor(svgElement: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: PathogenPlotData);
    plot(): void;
}
export {};
