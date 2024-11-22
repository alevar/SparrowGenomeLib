class GTFObject {
    seqid;
    strand;
    type;
    start;
    end;
    attributes;
    transcript_id;
    constructor(seqid, strand, start, end, type, attributes, transcript_id) {
        if (start < 0 || end < 0 || start > end) {
            throw new Error('Invalid interval');
        }
        this.seqid = seqid;
        this.strand = strand;
        this.start = start;
        this.end = end;
        this.type = type;
        this.attributes = attributes;
        this.transcript_id = transcript_id;
    }
    getAttribute(key) {
        return this.attributes[key];
    }
    getStart() {
        return this.start;
    }
    getEnd() {
        return this.end;
    }
}
class Exon extends GTFObject {
}
class CDS extends GTFObject {
}
class Object extends GTFObject {
    originalType;
    constructor(seqid, strand, start, end, type, attributes, originalType) {
        super(seqid, strand, start, end, type, attributes);
        this.originalType = originalType;
    }
}
class Transcript extends GTFObject {
    exons = [];
    cdsFeatures = [];
    gene_id;
    constructor(seqid, strand, start, end, attributes, transcript_id, gene_id) {
        super(seqid, strand, start, end, 'transcript', attributes, transcript_id);
        this.gene_id = gene_id;
    }
    addExon(exon) {
        if (exon.seqid !== this.seqid || exon.strand !== this.strand) {
            throw new Error(`Inconsistent seqid or strand in exon ${exon.transcript_id}`);
        }
        if (exon.start < this.start || exon.end > this.end) {
            throw new Error(`Exon ${exon.transcript_id} out of transcript bounds`);
        }
        this.exons.push(exon);
        this.exons.sort((a, b) => a.start - b.start);
    }
    addCDS(cds) {
        if (cds.seqid !== this.seqid || cds.strand !== this.strand) {
            throw new Error(`Inconsistent seqid or strand in CDS ${cds.transcript_id}`);
        }
        if (cds.start < this.start || cds.end > this.end) {
            throw new Error(`CDS ${cds.transcript_id} out of transcript bounds`);
        }
        this.cdsFeatures.push(cds);
        this.cdsFeatures.sort((a, b) => a.start - b.start);
    }
    getCDS() {
        return this.cdsFeatures;
    }
    getExons() {
        return this.exons;
    }
    getTranscriptId() {
        return this.transcript_id || "";
    }
}
class Transcriptome {
    seqid;
    strand;
    start;
    end;
    transcripts = [];
    otherFeatures = [];
    transcriptsByGene = new Map();
    transcriptsById = new Map();
    genome_length = 0;
    constructor(gtfFile) {
        if (gtfFile) {
            this.parseGTFFile(gtfFile);
        }
    }
    static async create(file) {
        const instance = new Transcriptome();
        await instance.parseGTFFile(file);
        return instance;
    }
    parseGTFFile(gtfFile) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = e.target?.result;
                    const lines = result.split('\n');
                    for (const line of lines) {
                        if (line.startsWith('#') || !line.trim())
                            continue;
                        const [seqid, , type, startStr, endStr, , strand, , attrStr] = line.split('\t');
                        const start = parseInt(startStr);
                        const end = parseInt(endStr);
                        const attributes = this.parseAttributes(attrStr);
                        // make sure seqid and strand is the same for all transcriptome otherwise set to current seqid if was undefined
                        if (this.seqid && this.seqid !== seqid) {
                            throw new Error('Inconsistent seqid');
                        }
                        if (this.strand && this.strand !== strand) {
                            throw new Error('Inconsistent strand');
                        }
                        this.seqid = seqid;
                        this.strand = strand;
                        // set start and end to the min and max of all transcriptome
                        if (this.start === undefined || this.start > parseInt(startStr)) {
                            this.start = parseInt(startStr);
                        }
                        if (this.end === undefined || this.end < parseInt(endStr)) {
                            this.end = parseInt(endStr);
                        }
                        switch (type) {
                            case 'transcript':
                            case 'exon':
                            case 'CDS':
                                break;
                            default:
                                const otherObject = new Object(seqid, strand, start, end, 'other', attributes, type);
                                this.otherFeatures.push(otherObject);
                                continue;
                        }
                        const transcript_id = attributes['transcript_id'];
                        let tx_idx;
                        switch (type) {
                            case 'transcript':
                                const gene_id = attributes['gene_id'];
                                const transcript = new Transcript(seqid, strand, start, end, attributes, transcript_id, gene_id);
                                this.transcripts.push(transcript);
                                tx_idx = this.transcripts.length - 1;
                                this.transcriptsById.set(transcript_id, tx_idx);
                                if (!this.transcriptsByGene.has(gene_id)) {
                                    this.transcriptsByGene.set(gene_id, []);
                                }
                                this.transcriptsByGene.get(gene_id)?.push(tx_idx);
                                break;
                            case 'exon':
                                tx_idx = this.transcriptsById.get(transcript_id);
                                if (tx_idx === undefined) {
                                    throw new Error(`Exon references unknown transcript_id ${transcript_id}`);
                                }
                                const exon = new Exon(seqid, strand, start, end, 'exon', attributes, transcript_id);
                                this.transcripts[tx_idx].addExon(exon);
                                break;
                            case 'CDS':
                                tx_idx = this.transcriptsById.get(transcript_id);
                                if (tx_idx === undefined) {
                                    throw new Error(`CDS references unknown transcript_id ${transcript_id}`);
                                }
                                const cds = new CDS(seqid, strand, start, end, 'CDS', attributes, transcript_id);
                                this.transcripts[tx_idx].addCDS(cds);
                                break;
                            default:
                                break;
                        }
                    }
                    resolve();
                }
                catch (error) {
                    console.error(`Failed to parse GTF file: ${error instanceof Error ? error.message : error}`);
                    reject(error);
                }
            };
            reader.onerror = () => {
                console.error('Failed to read the file');
                reject(new Error('Failed to read the file'));
            };
            reader.readAsText(gtfFile);
        });
    }
    parseAttributes(attrStr) {
        const attributes = {};
        attrStr.split(';').forEach(attr => {
            const [key, value] = attr.trim().split(' ');
            if (key && value) {
                attributes[key] = value.replace(/"/g, '');
            }
        });
        return attributes;
    }
    getTranscriptsByGene(gene_id) {
        const indices = this.transcriptsByGene.get(gene_id);
        if (!indices) {
            return undefined;
        }
        return indices.map(idx => this.transcripts[idx]);
    }
    getTranscriptById(transcript_id) {
        const idx = this.transcriptsById.get(transcript_id);
        if (idx === undefined) {
            return undefined;
        }
        return this.transcripts[idx];
    }
    getStart() {
        return this.start || 0;
    }
    getEnd() {
        return this.end || 0;
    }
    // iterator over transcripts
    [Symbol.iterator]() {
        let index = 0;
        const transcripts = this.transcripts;
        return {
            next() {
                if (index < transcripts.length) {
                    return { value: transcripts[index++], done: false };
                }
                else {
                    return { value: transcripts[index++], done: true };
                }
            }
        };
    }
    // iterator by gene. yields gene_id and a list of associated transcripts
    *genes() {
        for (const [gene_id, tx_indices] of this.transcriptsByGene) {
            const transcripts = tx_indices.map(idx => this.transcripts[idx]);
            yield [gene_id, transcripts];
        }
    }
    numTranscripts() {
        return this.transcripts.length;
    }
    // iterator over splice junctions
    *junctions() {
        const seen_junctions = new Set();
        for (const transcript of this.transcripts) {
            const exons = transcript.getExons();
            for (let i = 0; i < exons.length - 1; i++) {
                const junction = [exons[i].end, exons[i + 1].start];
                if (!seen_junctions.has(junction)) {
                    seen_junctions.add(junction);
                    yield [junction[0], junction[1]];
                }
            }
        }
    }
    *donors() {
        const seen_donors = new Set();
        for (const [donor,] of this.junctions()) {
            if (!seen_donors.has(donor)) {
                seen_donors.add(donor);
                yield donor;
            }
        }
    }
    *acceptors() {
        const seen_acceptors = new Set();
        for (const [, acceptor] of this.junctions()) {
            if (!seen_acceptors.has(acceptor)) {
                seen_acceptors.add(acceptor);
                yield acceptor;
            }
        }
    }
}
export { Transcriptome, Transcript, Exon, CDS };
//# sourceMappingURL=transcriptome.js.map