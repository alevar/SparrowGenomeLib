import { Dimensions, Transcript } from '../../types';
interface TranscriptPlotData {
    dimensions: Dimensions;
    transcript: Transcript;
    genome_length: number;
}
export declare class TranscriptPlot {
    private svg;
    private dimensions;
    private genome_length;
    private transcript;
    private exon_svgs;
    private cds_svgs;
    private intron_svgs;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: TranscriptPlotData);
    plot(): void;
}
export {};
