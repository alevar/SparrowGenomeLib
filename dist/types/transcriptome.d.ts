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
export { Transcriptome, Transcript, Exon, CDS };
//# sourceMappingURL=transcriptome.d.ts.map