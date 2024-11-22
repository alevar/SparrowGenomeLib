import { Transcriptome, Dimensions } from '../../types';
interface TranscriptomePlotData {
    transcriptome: Transcriptome;
    dimensions: Dimensions;
}
export declare class TranscriptomePlot {
    private svg;
    private dimensions;
    private transcriptome;
    private transcript_height;
    private genes;
    private gridConfig;
    private grid;
    constructor(svgElement: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: TranscriptomePlotData);
    plot(): any[];
}
interface TranscriptomePlotLabelsData {
    dimensions: Dimensions;
    genes: any[];
}
export declare class TranscriptomePlotLabels {
    private svg;
    private dimensions;
    private genes;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: TranscriptomePlotLabelsData);
    private createCurlyBracePath;
    plot(): void;
}
export {};
//# sourceMappingURL=TranscriptomePlot.d.ts.map