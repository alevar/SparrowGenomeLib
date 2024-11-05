export declare class GenomePlot {
    private svg;
    private dimensions;
    private genome_length;
    private gtf_data;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, dimensions: any, genome_length: number, gtf_data: any);
    plot(): void;
}
