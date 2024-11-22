import { Transcriptome, Dimensions } from '../../types';
interface ORFPlotData {
    transcriptome: Transcriptome;
    dimensions: Dimensions;
}
export declare class ORFPlot {
    private svg;
    private dimensions;
    private transcriptome;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: ORFPlotData);
    plot(): void;
}
export {};
//# sourceMappingURL=ORFPlot.d.ts.map