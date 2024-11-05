import * as d3$1 from 'd3';

interface BedLine {
    seqid: string;
    start: number;
    end: number;
    name: string;
    score: number;
    strand: string;
}
declare class BedData {
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
interface BedFile {
    data: BedData;
    fileName: string;
    status: 1 | 0 | -1;
}
type Interval = [number, number];
interface Dimensions {
    width: number;
    height: number;
    x: number;
    y: number;
    fontSize: number;
}

type FeatureType = 'transcript' | 'exon' | 'CDS' | 'other';
declare class GTFObject {
    seqid: string;
    strand: string;
    type: FeatureType;
    start: number;
    end: number;
    attributes: Record<string, string>;
    transcript_id?: string;
    constructor(seqid: string, strand: string, start: number, end: number, type: FeatureType, attributes: Record<string, string>, transcript_id?: string);
    getAttribute(key: string): string;
    getStart(): number;
    getEnd(): number;
}
declare class Exon extends GTFObject {
}
declare class CDS extends GTFObject {
}
declare class Transcript extends GTFObject {
    exons: Exon[];
    cdsFeatures: CDS[];
    gene_id: string;
    constructor(seqid: string, strand: string, start: number, end: number, attributes: Record<string, string>, transcript_id: string, gene_id: string);
    addExon(exon: Exon): void;
    addCDS(cds: CDS): void;
    getCDS(): CDS[];
    getExons(): Exon[];
    getTranscriptId(): string;
}
declare class Transcriptome {
    seqid?: string;
    strand?: string;
    start?: number;
    end?: number;
    transcripts: Transcript[];
    otherFeatures: GTFObject[];
    transcriptsByGene: Map<string, number[]>;
    transcriptsById: Map<string, number>;
    genome_length: number;
    constructor(gtfFile?: File);
    static create(file: File): Promise<Transcriptome>;
    private parseGTFFile;
    private parseAttributes;
    getTranscriptsByGene(gene_id: string): Transcript[] | undefined;
    getTranscriptById(transcript_id: string): Transcript | undefined;
    getStart(): number;
    getEnd(): number;
    [Symbol.iterator](): {
        next(): {
            value: Transcript;
            done: boolean;
        };
    };
    genes(): Generator<[string, Transcript[]], void, unknown>;
    numTranscripts(): number;
    junctions(): Generator<[number, number], void, unknown>;
    donors(): Generator<number, void, unknown>;
    acceptors(): Generator<number, void, unknown>;
}

interface GridConfig {
    columns: number;
    columnRatios: number[];
    rowRatiosPerColumn: number[][];
}
interface Padding {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
declare class D3Grid {
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

declare function parseBed(bedFileName: File): Promise<BedFile>;

declare function adjustIntervals(intervals: Interval[], start: number, end: number, separator: number): Interval[];
declare function computeMidpoint(a: number, b: number): number;

interface PathogenPlotData {
    transcriptome: Transcriptome;
    dimensions: Dimensions;
}
declare class PathogenPlot {
    private svg;
    private dimensions;
    private transcriptome;
    private gridConfig;
    private grid;
    constructor(svgElement: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: PathogenPlotData);
    plot(): void;
}

declare class GenomePlot {
    private svg;
    private dimensions;
    private genome_length;
    private gtf_data;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>, dimensions: any, genome_length: number, gtf_data: any);
    plot(): void;
}

interface ORFPlotData {
    transcriptome: Transcriptome;
    dimensions: Dimensions;
}
declare class ORFPlot {
    private svg;
    private dimensions;
    private transcriptome;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: ORFPlotData);
    plot(): void;
}

interface TranscriptomePlotData {
    transcriptome: Transcriptome;
    dimensions: Dimensions;
}
declare class TranscriptomePlot {
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
declare class TranscriptomePlotLabels {
    private svg;
    private dimensions;
    private genes;
    constructor(svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, data: TranscriptomePlotLabelsData);
    private createCurlyBracePath;
    plot(): void;
}

interface BarPlotData {
    dimensions: Dimensions;
    xScale: d3$1.ScaleLinear<number, number>;
    bedData: BedData;
    color: string;
    yScale?: d3$1.ScaleLinear<number, number>;
}
declare class BarPlot {
    private svg;
    private dimensions;
    private bedData;
    private xScale;
    private yScale;
    private useProvidedYScale;
    private color;
    constructor(svg: d3$1.Selection<SVGSVGElement, unknown, null, undefined>, data: BarPlotData);
    get_yScale(): d3$1.ScaleLinear<number, number>;
    plot(): void;
}

interface LinePlotData {
    dimensions: Dimensions;
    bedData: BedData;
    color: string;
    xScale: d3$1.ScaleLinear<number, number>;
    yScale?: d3$1.ScaleLinear<number, number>;
}
declare class LinePlot {
    private svg;
    private dimensions;
    private bedData;
    private xScale;
    private yScale;
    private useProvidedYScale;
    private color;
    constructor(svg: d3$1.Selection<SVGSVGElement, unknown, null, undefined>, data: LinePlotData);
    get_yScale(): d3$1.ScaleLinear<number, number>;
    plot(): void;
}

interface DataPlotArrayData {
    svg: d3$1.Selection<SVGSVGElement, unknown, null, undefined>;
    dimensions: Dimensions;
    elements: number[];
    elementWidth: number;
    coordinateLength: number;
    maxValue: number;
}
declare class DataPlotArray {
    private svg;
    private dimensions;
    private elements;
    private elementWidth;
    private coordinateLength;
    private maxValue;
    private yScale;
    private raw_xs;
    private spread_elements;
    private element_indices;
    private gridConfig;
    private grid;
    constructor(data: DataPlotArrayData);
    private build_xs;
    private build_grid;
    plot(): void;
    getElementSVG(index: number): d3$1.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
    getCellDimensions(index: number): {
        width: number;
        height: number;
    } | undefined;
    getCellCoordinates(index: number): {
        x: number;
        y: number;
    } | undefined;
    getYScale(): d3$1.ScaleLinear<number, number>;
    getElementMapping(index: number): [[number, number], [number, number]];
}

interface TriangleConnectorData {
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    dimensions: Dimensions;
    points: {
        "top": number;
        "left": number;
        "right": number;
        "mid": number;
    };
    color: string;
}
declare class TriangleConnector {
    private svg;
    private dimensions;
    private points;
    private color;
    constructor(data: TriangleConnectorData);
    plot(): void;
}

export { BarPlot, BedData, type BedFile, type BedLine, CDS, D3Grid, DataPlotArray, type Dimensions, Exon, GenomePlot, type GridConfig, type Interval, LinePlot, ORFPlot, type Padding, PathogenPlot, Transcript, Transcriptome, TranscriptomePlot, TranscriptomePlotLabels, TriangleConnector, adjustIntervals, computeMidpoint, parseBed };