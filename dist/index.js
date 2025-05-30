"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  BarPlot: () => BarPlot,
  BedData: () => BedData,
  BoxPlot: () => BoxPlot,
  CDS: () => CDS,
  D3Grid: () => D3Grid,
  DataPlotArray: () => DataPlotArray,
  Exon: () => Exon,
  FaiData: () => FaiData,
  GenomePlot: () => GenomePlot,
  IntegrationsData: () => IntegrationsData,
  LinePlot: () => LinePlot,
  ORFPlot: () => ORFPlot,
  PathogenPlot: () => PathogenPlot,
  SJData: () => SJData,
  Sequence: () => Sequence,
  SequenceLogo: () => SequenceLogo,
  Transcript: () => Transcript,
  Transcriptome: () => Transcriptome,
  TranscriptomePlot: () => TranscriptomePlot,
  TranscriptomePlotLabels: () => TranscriptomePlotLabels,
  TriangleConnector: () => TriangleConnector,
  adjustIntervals: () => adjustIntervals,
  computeMidpoint: () => computeMidpoint,
  parseBed: () => parseBed,
  parseFai: () => parseFai,
  parseIntegrations: () => parseIntegrations,
  parseSJ: () => parseSJ
});
module.exports = __toCommonJS(src_exports);

// src/types/types.ts
var SJData = class {
  data;
  constructor() {
    this.data = [];
  }
  addLine(line2) {
    this.data.push(line2);
  }
  sort() {
    this.data.sort((a, b) => a.position - b.position);
  }
  getData() {
    return this.data;
  }
};
var BedData = class _BedData {
  data;
  constructor() {
    this.data = [];
  }
  addLine(line2) {
    this.data.push(line2);
  }
  get length() {
    return this.data.length;
  }
  sort() {
    this.data.sort((a, b) => a.start - b.start);
  }
  numEntries() {
    return this.data.length;
  }
  maxScore() {
    return Math.max(...this.data.map((d) => d.score));
  }
  getData() {
    return this.data;
  }
  getPos(pos) {
    return this.data.filter((d) => d.start <= pos && d.end >= pos);
  }
  getRange(start, end) {
    let new_data = new _BedData();
    for (let i = 0; i < this.data.length; i++) {
      let line2 = this.data[i];
      if (line2.start <= end && line2.end > start) {
        let new_line = Object.assign({}, line2);
        new_line.start = Math.max(line2.start, start);
        new_line.end = Math.min(line2.end, end);
        new_data.addLine(new_line);
      }
    }
    return new_data;
  }
  explode() {
    let new_data = new _BedData();
    for (let i = 0; i < this.data.length; i++) {
      let line2 = this.data[i];
      for (let j = line2.start; j < line2.end; j++) {
        let new_line = { ...line2 };
        new_line.start = j;
        new_line.end = j + 1;
        new_data.addLine(new_line);
      }
    }
    return new_data;
  }
  smooth(windowSize) {
    const explodedData = this.explode();
    const explodedLines = explodedData.getData();
    explodedLines.sort((a, b) => {
      if (a.seqid !== b.seqid) {
        return a.seqid.localeCompare(b.seqid);
      }
      if (a.strand !== b.strand) {
        return a.strand.localeCompare(b.strand);
      }
      return a.start - b.start;
    });
    const smoothedData = new _BedData();
    if (explodedLines.length === 0) {
      return smoothedData;
    }
    const seqidStrandGroups = /* @__PURE__ */ new Map();
    explodedLines.forEach((line2) => {
      const key = `${line2.seqid}|${line2.strand}`;
      if (!seqidStrandGroups.has(key)) {
        seqidStrandGroups.set(key, []);
      }
      seqidStrandGroups.get(key).push(line2);
    });
    seqidStrandGroups.forEach((linesInGroup, key) => {
      const [seqid, strand] = key.split("|");
      const minPos = Math.min(...linesInGroup.map((d) => d.start));
      const maxPos = Math.max(...linesInGroup.map((d) => d.end));
      const positionGroups = /* @__PURE__ */ new Map();
      linesInGroup.forEach((line2) => {
        if (!positionGroups.has(line2.start)) {
          positionGroups.set(line2.start, []);
        }
        positionGroups.get(line2.start).push(line2);
      });
      for (let pos = minPos; pos < maxPos - windowSize + 1; pos++) {
        const windowEnd = pos + windowSize;
        const scores = [];
        for (let i = pos; i < windowEnd; i++) {
          if (positionGroups.has(i)) {
            const linesAtPos = positionGroups.get(i);
            linesAtPos.forEach((line2) => {
              scores.push(line2.score);
            });
          }
        }
        if (scores.length === 0) continue;
        const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        smoothedData.addLine({
          seqid,
          start: pos,
          end: windowEnd,
          score: meanScore,
          name: `smoothed_${seqid}_${strand}_${pos}_${windowEnd}`,
          strand
        });
      }
    });
    return smoothedData;
  }
};
var FaiData = class {
  data;
  constructor() {
    this.data = [];
  }
  addLine(line2) {
    this.data.push(line2);
  }
  get length() {
    return this.data.length;
  }
  numEntries() {
    return this.data.length;
  }
  getData() {
    return this.data;
  }
};
var IntegrationsData = class {
  data;
  constructor() {
    this.data = [];
  }
  addLine(line2) {
    this.data.push(line2);
  }
  get length() {
    return this.data.length;
  }
  numEntries() {
    return this.data.length;
  }
  getData() {
    return this.data;
  }
};

// src/types/transcriptome.ts
var GTFObject = class {
  seqid;
  strand;
  type;
  start;
  end;
  attributes;
  transcript_id;
  score;
  // Added missing field: score from GTF format
  source;
  // Added missing field: source from GTF format
  phase;
  // Added missing field: phase/frame from GTF format
  constructor(seqid, strand, start, end, type, attributes, transcript_id, score, source, phase) {
    if (start < 0 || end < 0 || start > end) {
      throw new Error("Invalid interval");
    }
    this.seqid = seqid;
    this.strand = strand;
    this.start = start;
    this.end = end;
    this.type = type;
    this.attributes = attributes;
    this.transcript_id = transcript_id;
    this.score = score;
    this.source = source;
    this.phase = phase;
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
  getStrand() {
    return this.strand;
  }
  getLength() {
    return this.end - this.start + 1;
  }
  getSeqId() {
    return this.seqid;
  }
  getType() {
    return this.type;
  }
};
var Exon = class extends GTFObject {
  getExonNumber() {
    const exonNumber = this.attributes["exon_number"];
    return exonNumber ? parseInt(exonNumber) : 0;
  }
};
var CDS = class extends GTFObject {
  getPhase() {
    return this.phase ? parseInt(this.phase) : 0;
  }
};
var Object2 = class extends GTFObject {
  originalType;
  constructor(seqid, strand, start, end, type, attributes, originalType, score, source, phase) {
    super(seqid, strand, start, end, type, attributes, void 0, score, source, phase);
    this.originalType = originalType;
  }
  getOriginalType() {
    return this.originalType;
  }
};
var Transcript = class extends GTFObject {
  exons = [];
  cdsFeatures = [];
  gene_id;
  gene_name;
  // Added missing field
  transcript_name;
  // Added missing field
  transcript_biotype;
  // Added missing field
  constructor(seqid, strand, start, end, attributes, transcript_id, gene_id) {
    super(seqid, strand, start, end, "transcript", attributes, transcript_id);
    this.gene_id = gene_id;
    this.gene_name = attributes["gene_name"];
    this.transcript_name = attributes["transcript_name"];
    this.transcript_biotype = attributes["transcript_biotype"];
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
  getGeneId() {
    return this.gene_id;
  }
  getGeneName() {
    return this.gene_name || this.gene_id;
  }
  getTranscriptName() {
    return this.transcript_name || this.transcript_id || "";
  }
  getBiotype() {
    return this.transcript_biotype || "";
  }
  getCodingLength() {
    return this.cdsFeatures.reduce((sum, cds) => sum + cds.getLength(), 0);
  }
  getTotalExonLength() {
    return this.exons.reduce((sum, exon) => sum + exon.getLength(), 0);
  }
  hasUTR() {
    return this.getCodingLength() > 0 && this.getCodingLength() < this.getTotalExonLength();
  }
};
var Transcriptome = class _Transcriptome {
  seqid;
  strand;
  start;
  end;
  transcripts = [];
  otherFeatures = [];
  transcriptsByGene = /* @__PURE__ */ new Map();
  transcriptsById = /* @__PURE__ */ new Map();
  geneNames = /* @__PURE__ */ new Map();
  // Added missing field: map of gene_id to gene_name
  genome_length = 0;
  source_file;
  // Added missing field: name of the source file
  assembly;
  // Added missing field: genome assembly information
  constructor(gtfFile) {
    if (gtfFile) {
      this.parseGTFFile(gtfFile);
      this.source_file = gtfFile.name;
    }
  }
  static fromExisting(existing) {
    const newTranscriptome = new _Transcriptome();
    newTranscriptome.seqid = existing.seqid;
    newTranscriptome.strand = existing.strand;
    newTranscriptome.start = existing.start;
    newTranscriptome.end = existing.end;
    newTranscriptome.genome_length = existing.genome_length;
    newTranscriptome.source_file = existing.source_file;
    newTranscriptome.assembly = existing.assembly;
    newTranscriptome.transcripts = [...existing.transcripts];
    newTranscriptome.otherFeatures = [...existing.otherFeatures];
    newTranscriptome.transcriptsByGene = new Map(existing.transcriptsByGene);
    newTranscriptome.transcriptsById = new Map(existing.transcriptsById);
    newTranscriptome.geneNames = new Map(existing.geneNames);
    return newTranscriptome;
  }
  static async create(file) {
    const instance = new _Transcriptome();
    await instance.parseGTFFile(file);
    instance.source_file = file.name;
    return instance;
  }
  parseGTFFile(gtfFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          const lines = result.split("\n");
          for (const line2 of lines) {
            if (line2.startsWith("#") || !line2.trim()) continue;
            const [seqid, source, type, startStr, endStr, score, strand, phase, attrStr] = line2.split("	");
            const start = parseInt(startStr);
            const end = parseInt(endStr);
            const attributes = this.parseAttributes(attrStr);
            if (this.seqid && this.seqid !== seqid) {
              throw new Error("Inconsistent seqid");
            }
            if (this.strand && this.strand !== strand) {
              throw new Error("Inconsistent strand");
            }
            this.seqid = seqid;
            this.strand = strand;
            if (this.start === void 0 || this.start > parseInt(startStr)) {
              this.start = parseInt(startStr);
            }
            if (this.end === void 0 || this.end < parseInt(endStr)) {
              this.end = parseInt(endStr);
            }
            if (attributes["gene_id"] && attributes["gene_name"]) {
              this.geneNames.set(attributes["gene_id"], attributes["gene_name"]);
            }
            switch (type) {
              case "transcript":
              case "exon":
              case "CDS":
                break;
              default:
                const otherObject = new Object2(seqid, strand, start, end, "other", attributes, type, score, source, phase);
                this.otherFeatures.push(otherObject);
                continue;
            }
            const transcript_id = attributes["transcript_id"];
            let tx_idx;
            switch (type) {
              case "transcript":
                const gene_id = attributes["gene_id"];
                const transcript = new Transcript(seqid, strand, start, end, attributes, transcript_id, gene_id);
                this.transcripts.push(transcript);
                tx_idx = this.transcripts.length - 1;
                this.transcriptsById.set(transcript_id, tx_idx);
                if (!this.transcriptsByGene.has(gene_id)) {
                  this.transcriptsByGene.set(gene_id, []);
                }
                this.transcriptsByGene.get(gene_id)?.push(tx_idx);
                break;
              case "exon":
                tx_idx = this.transcriptsById.get(transcript_id);
                if (tx_idx === void 0) {
                  throw new Error(`Exon references unknown transcript_id ${transcript_id}`);
                }
                const exon = new Exon(seqid, strand, start, end, "exon", attributes, transcript_id, score, source, phase);
                this.transcripts[tx_idx].addExon(exon);
                break;
              case "CDS":
                tx_idx = this.transcriptsById.get(transcript_id);
                if (tx_idx === void 0) {
                  throw new Error(`CDS references unknown transcript_id ${transcript_id}`);
                }
                const cds = new CDS(seqid, strand, start, end, "CDS", attributes, transcript_id, score, source, phase);
                this.transcripts[tx_idx].addCDS(cds);
                break;
              default:
                break;
            }
          }
          resolve();
        } catch (error) {
          console.error(`Failed to parse GTF file: ${error instanceof Error ? error.message : error}`);
          reject(error);
        }
      };
      reader.onerror = () => {
        console.error("Failed to read the file");
        reject(new Error("Failed to read the file"));
      };
      reader.readAsText(gtfFile);
    });
  }
  parseAttributes(attrStr) {
    const attributes = {};
    attrStr.split(";").forEach((attr) => {
      const [key, value] = attr.trim().split(" ");
      if (key && value) {
        attributes[key] = value.replace(/"/g, "");
      }
    });
    return attributes;
  }
  getTranscriptsByGene(gene_id) {
    const indices = this.transcriptsByGene.get(gene_id);
    if (!indices) {
      return void 0;
    }
    return indices.map((idx) => this.transcripts[idx]);
  }
  getTranscriptById(transcript_id) {
    const idx = this.transcriptsById.get(transcript_id);
    if (idx === void 0) {
      return void 0;
    }
    return this.transcripts[idx];
  }
  getGeneName(gene_id) {
    return this.geneNames.get(gene_id) || gene_id;
  }
  getGeneIds() {
    return Array.from(this.transcriptsByGene.keys());
  }
  getStart() {
    return this.start || 0;
  }
  getEnd() {
    return this.end || 0;
  }
  getStrand() {
    return this.strand || "";
  }
  getSeqId() {
    return this.seqid || "";
  }
  // Added method to get genome/chromosome size
  getGenomeLength() {
    if (this.genome_length === 0 && this.start !== void 0 && this.end !== void 0) {
      return this.end - this.start + 1;
    }
    return this.genome_length;
  }
  // Added method to get summary statistics
  getSummaryStats() {
    const geneCount = this.transcriptsByGene.size;
    const transcriptCount = this.numTranscripts();
    const exonCount = this.transcripts.reduce((sum, tx) => sum + tx.exons.length, 0);
    return {
      geneCount,
      transcriptCount,
      exonCount,
      seqid: this.seqid,
      strand: this.strand,
      start: this.start,
      end: this.end
    };
  }
  // iterator over transcripts
  [Symbol.iterator]() {
    let index = 0;
    const transcripts = this.transcripts;
    return {
      next() {
        if (index < transcripts.length) {
          return { value: transcripts[index++], done: false };
        } else {
          return { value: transcripts[index++], done: true };
        }
      }
    };
  }
  // iterator by gene. yields gene_id and a list of associated transcripts
  *genes() {
    for (const [gene_id, tx_indices] of this.transcriptsByGene) {
      const transcripts = tx_indices.map((idx) => this.transcripts[idx]);
      yield [gene_id, transcripts];
    }
  }
  numTranscripts() {
    return this.transcripts.length;
  }
  numGenes() {
    return this.transcriptsByGene.size;
  }
  // iterator over splice junctions
  *junctions() {
    const seen_junctions = /* @__PURE__ */ new Set();
    for (const transcript of this.transcripts) {
      const exons = transcript.getExons();
      for (let i = 0; i < exons.length - 1; i++) {
        const junctionKey = `${exons[i].end}-${exons[i + 1].start}`;
        if (!seen_junctions.has(junctionKey)) {
          seen_junctions.add(junctionKey);
          yield [exons[i].end, exons[i + 1].start];
        }
      }
    }
  }
  *donors() {
    const seen_donors = /* @__PURE__ */ new Set();
    for (const [donor] of this.junctions()) {
      if (!seen_donors.has(donor)) {
        seen_donors.add(donor);
        yield donor;
      }
    }
  }
  *acceptors() {
    const seen_acceptors = /* @__PURE__ */ new Set();
    for (const [, acceptor] of this.junctions()) {
      if (!seen_acceptors.has(acceptor)) {
        seen_acceptors.add(acceptor);
        yield acceptor;
      }
    }
  }
  // Iterator for CDS features
  *cds() {
    for (const transcript of this.transcripts) {
      for (const cdsFeature of transcript.getCDS()) {
        yield cdsFeature;
      }
    }
  }
  // Iterator for all exons
  *exons() {
    for (const transcript of this.transcripts) {
      for (const exon of transcript.getExons()) {
        yield exon;
      }
    }
  }
  // Get the number of unique exons (by coordinates)
  countUniqueExons() {
    const uniqueExons = /* @__PURE__ */ new Set();
    for (const exon of this.exons()) {
      uniqueExons.add(`${exon.start}-${exon.end}`);
    }
    return uniqueExons.size;
  }
};

// src/types/sequence.ts
var Sequence = class _Sequence {
  sequences = /* @__PURE__ */ new Map();
  primarySeqId = "";
  length = 0;
  source_file;
  constructor() {
  }
  /**
   * Create a Sequence instance from a FASTA file
   */
  static async create(file) {
    const instance = new _Sequence();
    await instance.parseFastaFile(file);
    instance.source_file = file.name;
    return instance;
  }
  /**
   * Parse a FASTA file and populate the sequences map
   */
  parseFastaFile(fastaFile) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          const lines = result.split("\n");
          let currentSeqId = "";
          let currentSequence = "";
          for (const line2 of lines) {
            if (line2.trim() === "") continue;
            if (line2.startsWith(">")) {
              if (currentSeqId && currentSequence) {
                this.sequences.set(currentSeqId, currentSequence);
                if (!this.primarySeqId) {
                  this.primarySeqId = currentSeqId;
                  this.length = currentSequence.length;
                }
              }
              currentSeqId = line2.substring(1).trim().split(/\s+/)[0];
              currentSequence = "";
            } else {
              currentSequence += line2.trim().toUpperCase();
            }
          }
          if (currentSeqId && currentSequence) {
            this.sequences.set(currentSeqId, currentSequence);
            if (!this.primarySeqId) {
              this.primarySeqId = currentSeqId;
              this.length = currentSequence.length;
            }
          }
          if (this.sequences.size === 0) {
            throw new Error("No valid sequences found in FASTA file");
          }
          resolve();
        } catch (error) {
          console.error(`Failed to parse FASTA file: ${error instanceof Error ? error.message : error}`);
          reject(error);
        }
      };
      reader.onerror = () => {
        console.error("Failed to read the file");
        reject(new Error("Failed to read the file"));
      };
      reader.readAsText(fastaFile);
    });
  }
  /**
   * Get the DNA sequence for a specific region
   */
  getSubsequence(start, end, seqId) {
    const id = seqId || this.primarySeqId;
    const sequence = this.sequences.get(id);
    if (!sequence) {
      throw new Error(`Sequence with ID ${id} not found`);
    }
    if (start < 1 || end > sequence.length || start > end) {
      throw new Error(`Invalid coordinates: start=${start}, end=${end}, sequence length=${sequence.length}`);
    }
    return sequence.substring(start - 1, end);
  }
  /**
   * Get the entire sequence for a specified seqId
   */
  getSequence(seqId) {
    const id = seqId || this.primarySeqId;
    const sequence = this.sequences.get(id);
    if (!sequence) {
      throw new Error(`Sequence with ID ${id} not found`);
    }
    return sequence;
  }
  /**
   * Get the reverse complement of a sequence
   */
  getReverseComplement(seqId) {
    const sequence = this.getSequence(seqId);
    return this.reverseComplement(sequence);
  }
  /**
   * Helper function to get reverse complement of a DNA string
   */
  reverseComplement(seq) {
    const complement = {
      "A": "T",
      "T": "A",
      "G": "C",
      "C": "G",
      "a": "t",
      "t": "a",
      "g": "c",
      "c": "g",
      "N": "N",
      "n": "n"
    };
    return seq.split("").reverse().map((base) => complement[base] || base).join("");
  }
  /**
   * Get sequence IDs
   */
  getSequenceIds() {
    return Array.from(this.sequences.keys());
  }
  /**
   * Get primary sequence ID
   */
  getPrimarySequenceId() {
    return this.primarySeqId;
  }
  /**
   * Set primary sequence ID
   */
  setPrimarySequenceId(seqId) {
    if (!this.sequences.has(seqId)) {
      throw new Error(`Sequence with ID ${seqId} not found`);
    }
    this.primarySeqId = seqId;
    this.length = this.sequences.get(seqId)?.length || 0;
  }
  /**
   * Get length of the sequence
   */
  getLength(seqId) {
    if (seqId) {
      const seq = this.sequences.get(seqId);
      return seq ? seq.length : 0;
    }
    return this.length;
  }
  /**
   * Get source file name
   */
  getSourceFile() {
    return this.source_file;
  }
  /**
   * Check if sequence contains a specific seqId
   */
  hasSequence(seqId) {
    return this.sequences.has(seqId);
  }
  /**
   * Get GC content of a sequence
   */
  getGCContent(seqId) {
    const sequence = this.getSequence(seqId);
    if (!sequence || sequence.length === 0) return 0;
    const gcCount = (sequence.match(/[GC]/gi) || []).length;
    return gcCount / sequence.length;
  }
  /**
   * Translate DNA sequence to protein (basic implementation)
   */
  translateToProtein(start, end, seqId) {
    const dnaSeq = this.getSubsequence(start, end, seqId);
    const geneticCode = {
      "TTT": "F",
      "TTC": "F",
      "TTA": "L",
      "TTG": "L",
      "CTT": "L",
      "CTC": "L",
      "CTA": "L",
      "CTG": "L",
      "ATT": "I",
      "ATC": "I",
      "ATA": "I",
      "ATG": "M",
      "GTT": "V",
      "GTC": "V",
      "GTA": "V",
      "GTG": "V",
      "TCT": "S",
      "TCC": "S",
      "TCA": "S",
      "TCG": "S",
      "CCT": "P",
      "CCC": "P",
      "CCA": "P",
      "CCG": "P",
      "ACT": "T",
      "ACC": "T",
      "ACA": "T",
      "ACG": "T",
      "GCT": "A",
      "GCC": "A",
      "GCA": "A",
      "GCG": "A",
      "TAT": "Y",
      "TAC": "Y",
      "TAA": "*",
      "TAG": "*",
      "CAT": "H",
      "CAC": "H",
      "CAA": "Q",
      "CAG": "Q",
      "AAT": "N",
      "AAC": "N",
      "AAA": "K",
      "AAG": "K",
      "GAT": "D",
      "GAC": "D",
      "GAA": "E",
      "GAG": "E",
      "TGT": "C",
      "TGC": "C",
      "TGA": "*",
      "TGG": "W",
      "CGT": "R",
      "CGC": "R",
      "CGA": "R",
      "CGG": "R",
      "AGT": "S",
      "AGC": "S",
      "AGA": "R",
      "AGG": "R",
      "GGT": "G",
      "GGC": "G",
      "GGA": "G",
      "GGG": "G"
    };
    let protein = "";
    for (let i = 0; i < dnaSeq.length; i += 3) {
      if (i + 3 > dnaSeq.length) break;
      const codon = dnaSeq.substring(i, i + 3).toUpperCase();
      protein += geneticCode[codon] || "X";
    }
    return protein;
  }
  /**
   * Calculate nucleotide frequencies
   */
  getNucleotideFrequencies(seqId) {
    const sequence = this.getSequence(seqId).toUpperCase();
    const frequencies = { A: 0, C: 0, G: 0, T: 0, N: 0, Other: 0 };
    for (const base of sequence) {
      if (base in frequencies) {
        frequencies[base]++;
      } else {
        frequencies.Other++;
      }
    }
    return frequencies;
  }
  /**
   * Create a summary of sequence properties
   */
  getSummary(seqId) {
    const id = seqId || this.primarySeqId;
    const sequence = this.sequences.get(id);
    if (!sequence) {
      throw new Error(`Sequence with ID ${id} not found`);
    }
    const frequencies = this.getNucleotideFrequencies(id);
    return {
      id,
      length: sequence.length,
      gc_content: this.getGCContent(id),
      nucleotide_counts: frequencies
    };
  }
};

// src/types/plotGrid.ts
var D3Grid = class {
  height;
  width;
  gridConfig;
  svg;
  cellDimensions_raw;
  cellDimensions;
  cellCoordinates;
  cellData;
  // holds any data associated with each cell
  cellSvgs;
  constructor(svg, height, width, gridConfig) {
    this.height = height;
    this.width = width;
    this.gridConfig = gridConfig;
    this.cellDimensions_raw = [];
    this.cellDimensions = [];
    this.cellCoordinates = [];
    this.cellData = [];
    this.cellSvgs = [];
    this.svg = svg.attr("width", this.width).attr("height", this.height);
    this.setupGrid();
  }
  setupGrid() {
    const totalColumnRatio = this.gridConfig.columnRatios.reduce((sum, ratio) => sum + ratio, 0);
    let xOffset = 0;
    this.gridConfig.columnRatios.forEach((colRatio, colIndex) => {
      const columnWidth = colRatio / totalColumnRatio * this.width;
      const totalRowRatio = this.gridConfig.rowRatiosPerColumn[colIndex].reduce((sum, ratio) => sum + ratio, 0);
      this.cellDimensions_raw[colIndex] = [];
      this.cellDimensions[colIndex] = [];
      this.cellCoordinates[colIndex] = [];
      this.cellData[colIndex] = [];
      this.cellSvgs[colIndex] = [];
      let yOffset = 0;
      this.gridConfig.rowRatiosPerColumn[colIndex].forEach((rowRatio, rowIndex) => {
        const rowHeight = rowRatio / totalRowRatio * this.height;
        const paddedWidth = columnWidth;
        const paddedHeight = rowHeight;
        this.cellDimensions_raw[colIndex][rowIndex] = { width: columnWidth, height: rowHeight };
        this.cellDimensions[colIndex][rowIndex] = { width: paddedWidth, height: paddedHeight };
        this.cellCoordinates[colIndex][rowIndex] = { x: xOffset, y: yOffset };
        this.cellData[colIndex][rowIndex] = {};
        const new_svg = this.svg.append("svg").attr("x", xOffset).attr("y", yOffset).attr("width", columnWidth).attr("height", rowHeight);
        this.cellSvgs[colIndex][rowIndex] = new_svg;
        yOffset += rowHeight;
      });
      xOffset += columnWidth;
    });
  }
  getCellData(colIndex, rowIndex) {
    return this.cellData[colIndex]?.[rowIndex];
  }
  setCellData(colIndex, rowIndex, data) {
    this.cellData[colIndex][rowIndex] = data;
  }
  getSvg() {
    return this.svg;
  }
  getCellDimensions(colIndex, rowIndex) {
    return this.cellDimensions[colIndex]?.[rowIndex];
  }
  getCellCoordinates_unpadded(colIndex, rowIndex) {
    return this.cellCoordinates[colIndex]?.[rowIndex];
  }
  getCellCoordinates(colIndex, rowIndex) {
    const coordinates = this.cellCoordinates[colIndex]?.[rowIndex];
    if (coordinates) {
      return {
        x: coordinates.x,
        y: coordinates.y
      };
    }
    return void 0;
  }
  getCellSvg(colIndex, rowIndex) {
    return this.cellSvgs[colIndex]?.[rowIndex];
  }
  createOverlaySvg(colIndex, rowIndices) {
    const combinedHeight = rowIndices.reduce((sum, rowIndex) => sum + this.cellDimensions_raw[colIndex][rowIndex].height, 0);
    const firstRowIndex = rowIndices[0];
    const firstCellCoords = this.getCellCoordinates_unpadded(colIndex, firstRowIndex);
    const combinedWidth = this.cellDimensions[colIndex][firstRowIndex].width;
    const overlaySvg = this.svg.append("svg").attr("x", firstCellCoords?.x || 0).attr("y", firstCellCoords?.y || 0).attr("width", combinedWidth).attr("height", combinedHeight).style("pointer-events", "none");
    return overlaySvg;
  }
  promote(colIndex, rowIndex) {
    const cellSvg = this.getCellSvg(colIndex, rowIndex);
    if (cellSvg) {
      cellSvg.raise();
    }
  }
};

// src/utils/parsers/parsers.ts
function parseBed(bedFileName) {
  return new Promise((resolve, reject) => {
    const bedFile = {
      data: new BedData(),
      fileName: bedFileName.name,
      status: 1
    };
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        const lines = result.split("\n");
        lines.forEach((line2) => {
          if (line2.trim() === "") {
            return;
          }
          const fields = line2.split("	");
          if (fields.length === 6) {
            const [seqid, start, end, name, score, strand] = fields;
            const bedLine = {
              seqid,
              start: parseInt(start),
              end: parseInt(end),
              name,
              score: parseFloat(score),
              strand
            };
            bedFile.data.addLine(bedLine);
          } else {
            throw new Error(`Invalid line format: ${line2}`);
          }
        });
        resolve(bedFile);
      } catch (error) {
        reject(new Error("Failed to parse BED file"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    reader.readAsText(bedFileName);
  });
}
function parseSJ(sjFileName) {
  return new Promise((resolve, reject) => {
    const sjFile = {
      data: new SJData(),
      fileName: sjFileName.name,
      status: 1
    };
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        const lines = result.split("\n");
        lines.forEach((line2, idx) => {
          if (idx === 0) {
            return;
          }
          if (line2.trim() === "") {
            return;
          }
          const fields = line2.split("	");
          if (fields.length === 7) {
            const [seqid, position, A, C, G, T, N] = fields;
            const sjLine = {
              seqid,
              position: parseInt(position),
              A: parseInt(A),
              C: parseInt(C),
              G: parseInt(G),
              T: parseInt(T),
              N: parseInt(N)
            };
            sjFile.data.addLine(sjLine);
          } else {
            throw new Error(`Invalid line format: ${line2}`);
          }
        });
        resolve(sjFile);
      } catch (error) {
        reject(new Error("Failed to parse SJ file"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    reader.readAsText(sjFileName);
  });
}
function parseFai(faiFileName) {
  return new Promise((resolve, reject) => {
    const faiFile = {
      data: new FaiData(),
      fileName: faiFileName.name,
      status: 1
    };
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        const lines = result.split("\n");
        lines.forEach((line2) => {
          if (line2.trim() === "") {
            return;
          }
          const fields = line2.split("	");
          if (fields.length === 5) {
            const [seqid, seq_length, offset, lineBases, lineBytes] = fields;
            const faiLine = {
              seqid,
              seq_length: parseInt(seq_length),
              offset: parseInt(offset),
              lineBases: parseInt(lineBases),
              lineBytes: parseInt(lineBytes)
            };
            faiFile.data.addLine(faiLine);
          } else {
            throw new Error(`Invalid line format: ${line2}`);
          }
        });
        resolve(faiFile);
      } catch (error) {
        reject(new Error("Failed to parse Fasta Index file"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    reader.readAsText(faiFileName);
  });
}
function parseIntegrations(integrationsFileName) {
  return new Promise((resolve, reject) => {
    const integrationsFile = {
      data: new IntegrationsData(),
      fileName: integrationsFileName.name,
      status: 1
    };
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        const lines = result.split("\n");
        lines.forEach((line2) => {
          if (line2.trim() === "") {
            return;
          }
          const fields = line2.split("	");
          if (fields.length === 8) {
            const [seqid1, seqid2, position1, position2, score, junction1, junction2, gene1] = fields;
            const integrationsLine = {
              seqid1,
              seqid2,
              position1: parseInt(position1),
              position2: parseInt(position2),
              score: parseInt(score)
            };
            if (junction1) integrationsLine.junction1 = junction1;
            if (junction2) integrationsLine.junction2 = junction2;
            if (gene1) integrationsLine.gene1 = gene1;
            integrationsFile.data.addLine(integrationsLine);
          } else {
            throw new Error(`Invalid line format: ${line2}`);
          }
        });
        resolve(integrationsFile);
      } catch (error) {
        reject(new Error("Failed to parse Integrations file"));
      }
    };
    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };
    reader.readAsText(integrationsFileName);
  });
}

// src/utils/utils/utils.ts
function adjustIntervals(intervals, start, end, separator) {
  if (intervals.length <= 1) {
    return intervals;
  }
  intervals.sort((a, b) => a[0] - b[0]);
  const totalIntervals = intervals.length;
  const totalSpace = end - start;
  const totalIntervalWidth = intervals.reduce((acc, interval) => acc + (interval[1] - interval[0] + separator), 0);
  const emptyScaleFactor = (totalSpace - totalIntervalWidth) / totalSpace;
  let negativeIntervals = [[0, 0]];
  for (let i = 0; i < totalIntervals; i++) {
    const midpoint = computeMidpoint(intervals[i][0], intervals[i][1]);
    negativeIntervals[negativeIntervals.length - 1][1] = midpoint;
    negativeIntervals.push([midpoint, end]);
  }
  let scaledSpacerWidths = [];
  for (let i = 0; i < negativeIntervals.length; i++) {
    const interval = negativeIntervals[i];
    const intervalWidth = interval[1] - interval[0] - separator;
    const scaledWidth = intervalWidth * emptyScaleFactor;
    scaledSpacerWidths.push(scaledWidth);
  }
  let new_intervals = [];
  let prev_end = start;
  for (let i = 0; i < totalIntervals; i++) {
    const interval = intervals[i];
    const intervalWidth = interval[1] - interval[0];
    const spacer = scaledSpacerWidths[i] + separator;
    const new_interval = [prev_end + spacer, prev_end + spacer + intervalWidth];
    prev_end = new_interval[1];
    new_intervals.push(new_interval);
  }
  return new_intervals;
}
function computeMidpoint(a, b) {
  if (a > b) {
    [a, b] = [b, a];
  }
  const midpoint = (a + b) / 2;
  return midpoint;
}

// src/utils/plots/PathogenPlot.ts
var PathogenPlot = class {
  svg;
  dimensions;
  transcriptome;
  gridConfig = {
    columns: 1,
    columnRatios: [1],
    rowRatiosPerColumn: [
      [0, 1]
      // genomePlot, ORFPlot
    ]
  };
  grid;
  constructor(svgElement, data) {
    this.svg = svgElement;
    this.dimensions = data.dimensions;
    this.transcriptome = data.transcriptome;
    this.grid = new D3Grid(this.svg, this.dimensions.height, this.dimensions.width, this.gridConfig);
  }
  plot() {
    const orfPlotSvg = this.grid.getCellSvg(0, 1);
    if (orfPlotSvg) {
      const svg_dimensions = this.grid.getCellDimensions(0, 1);
      const svg_coordinates = this.grid.getCellCoordinates(0, 1);
      const orfPlotDimensions = {
        width: svg_dimensions?.width || 0,
        height: svg_dimensions?.height || 0,
        x: svg_coordinates?.x || 0,
        y: svg_coordinates?.y || 0,
        fontSize: this.dimensions.fontSize
      };
      const orfPlot = new ORFPlot(this.svg, {
        dimensions: orfPlotDimensions,
        transcriptome: this.transcriptome
      });
      orfPlot.plot();
    }
  }
};

// src/utils/plots/GenomePlot.ts
var GenomePlot = class {
  svg;
  dimensions;
  genome_length;
  gtf_data;
  constructor(svg, dimensions, genome_length, gtf_data) {
    this.svg = svg;
    this.dimensions = dimensions;
    this.genome_length = genome_length;
    this.gtf_data = gtf_data;
  }
  plot() {
    this.svg.append("rect").attr("x", 0).attr("y", this.dimensions["y"]).attr("width", this.dimensions["width"]).attr("height", this.dimensions["height"]).attr("rx", this.dimensions["height"] / 2).attr("ry", this.dimensions["height"] / 2).style("fill", "#dddddd");
    for (const component of this.gtf_data["genome_components"]) {
      if (component["type"] === "ltr") {
        this.svg.append("rect").attr("x", component["position"][0] / this.genome_length * this.dimensions["width"]).attr("y", this.dimensions["y"]).attr("width", (component["position"][1] - component["position"][0]) / this.genome_length * this.dimensions["width"]).attr("height", this.dimensions["height"]).attr("rx", this.dimensions["height"] / 2).attr("ry", this.dimensions["height"] / 2).style("fill", "#3652AD");
      }
    }
    for (const component of this.gtf_data["genome_components"]) {
      if (component["type"] === "ltr") {
        this.svg.append("text").attr("x", component["position"][0] / this.genome_length * this.dimensions["width"] + (component["position"][1] - component["position"][0]) / this.genome_length * this.dimensions["width"] / 2).attr("y", this.dimensions["y"] + this.dimensions["height"] / 1.25).attr("text-anchor", "middle").style("fill", "white").style("font-size", this.dimensions["font_size"] + "px").text(component["name"]);
      }
    }
  }
};

// src/utils/plots/ORFPlot.ts
var ORFPlot = class {
  svg;
  dimensions;
  transcriptome;
  constructor(svg, data) {
    this.svg = svg;
    this.dimensions = data.dimensions;
    this.transcriptome = data.transcriptome;
  }
  plot() {
    const unique_orfs = /* @__PURE__ */ new Set();
    const orfs = [];
    for (const transcript of this.transcriptome) {
      if (transcript.getCDS().length === 0) {
        continue;
      }
      const CDSs = transcript.getCDS();
      const cds_chain = CDSs.map((obj) => [obj.getStart(), obj.getEnd()]);
      const cds_string = cds_chain.toString();
      if (!unique_orfs.has(cds_string)) {
        unique_orfs.add(cds_string);
        orfs.push({ "orf": transcript.getCDS(), "gene_name": transcript.getAttribute("gene_name"), "y": 0 });
      }
    }
    orfs.sort((a, b) => a["orf"][0].getStart() - b["orf"][0].getStart());
    let rows = [];
    for (const orf of orfs) {
      let found_row = false;
      let row_i = 0;
      for (const row of rows) {
        if (orf["orf"][0].getStart() > row) {
          found_row = true;
          rows[row_i] = orf["orf"][orf["orf"].length - 1].getEnd();
          orf["y"] = row_i;
          break;
        }
        row_i += 1;
      }
      if (!found_row) {
        rows.push(orf["orf"][orf["orf"].length - 1].getEnd());
        orf["y"] = rows.length - 1;
      }
    }
    const orf_height = this.dimensions["height"] / rows.length * 0.8;
    const offset = this.dimensions["height"] / rows.length;
    for (const orf of orfs) {
      for (let c_i = 0; c_i < orf["orf"].length; c_i++) {
        const cds = orf["orf"][c_i];
        const cds_start = cds.getStart() / this.transcriptome.getEnd() * this.dimensions["width"];
        const cds_end = cds.getEnd() / this.transcriptome.getEnd() * this.dimensions["width"];
        const orf_y = this.dimensions["y"] + orf["y"] * offset;
        const orfSvg = this.svg.append("g");
        let cur_seg = orfSvg.append("rect").attr("x", cds_start).attr("y", orf_y).attr("height", orf_height).style("fill", "#F2C14E");
        if (c_i === orf["orf"].length - 1) {
          cur_seg.attr("width", cds_end - cds_start - 10);
          const trianglePoints = `${cds_end - 10},${orf_y + orf_height} ${cds_end - 10},${orf_y} ${cds_end},${orf_y + orf_height / 2}`;
          orfSvg.append("polygon").attr("points", trianglePoints).style("fill", "#F2C14E");
        } else {
          cur_seg.attr("width", cds_end - cds_start);
        }
        if (c_i > 0) {
          const prev_cds_end = orf["orf"][c_i - 1].getEnd() / this.transcriptome.getEnd() * this.dimensions["width"];
          orfSvg.append("line").attr("x1", prev_cds_end).attr("y1", orf_y + orf_height / 2).attr("x2", cds_start).attr("y2", orf_y + orf_height / 2).style("stroke", "#280274").style("stroke-width", 1);
        }
      }
      const orf_midpoint = (orf["orf"][0].getStart() + orf["orf"][orf["orf"].length - 1].getEnd()) / 2;
      const orf_label_x = orf_midpoint / this.transcriptome.getEnd() * this.dimensions["width"];
      this.svg.append("text").attr("x", orf_label_x).attr("y", this.dimensions["y"] + orf["y"] * offset + orf_height / 2).attr("text-anchor", "middle").style("fill", "black").style("font-size", this.dimensions["fontSize"] + "px").text(orf["gene_name"]);
    }
  }
};

// src/utils/plots/TranscriptPlot.ts
var TranscriptPlot = class {
  svg;
  dimensions;
  genome_length;
  transcript;
  exon_svgs;
  cds_svgs;
  intron_svgs;
  constructor(svg, data) {
    this.svg = svg;
    this.dimensions = data.dimensions;
    this.genome_length = data.genome_length;
    this.transcript = data.transcript;
    this.exon_svgs = [];
    this.cds_svgs = [];
    this.intron_svgs = [];
  }
  plot() {
    let e_i = 0;
    const exons = this.transcript.getExons();
    for (const exon of exons) {
      const exon_start = exon.getStart() / this.genome_length * this.dimensions["width"];
      const exon_end = exon.getEnd() / this.genome_length * this.dimensions["width"];
      const exonSvg = this.svg.append("rect").attr("x", exon_start).attr("y", this.dimensions["height"] * ((1 - 0.5) / 2)).attr("width", exon_end - exon_start).attr("height", this.dimensions["height"] * 0.5).style("fill", "#4A88CA");
      this.exon_svgs.push(exonSvg);
      if (e_i > 0) {
        const prev_exon_end = exons[e_i - 1].getEnd() / this.genome_length * this.dimensions["width"];
        const intronSvg = this.svg.append("line").attr("x1", prev_exon_end).attr("y1", this.dimensions["height"] / 2).attr("x2", exon_start).attr("y2", this.dimensions["height"] / 2).style("stroke", "#280274").style("stroke-width", 1);
        this.intron_svgs.push(intronSvg);
      }
      e_i += 1;
    }
    const CDSs = this.transcript.getCDS();
    for (const cds of CDSs) {
      const cds_start = cds.getStart() / this.genome_length * this.dimensions["width"];
      const cds_end = cds.getEnd() / this.genome_length * this.dimensions["width"];
      const cdsSvg = this.svg.append("rect").attr("x", cds_start).attr("y", this.dimensions["height"] * ((1 - 0.75) / 2)).attr("width", cds_end - cds_start).attr("height", this.dimensions["height"] * 0.75).style("fill", "#F2C14E");
      this.cds_svgs.push(cdsSvg);
    }
    ;
  }
};

// src/utils/plots/TranscriptomePlot.ts
var TranscriptomePlot = class {
  svg;
  dimensions;
  transcriptome;
  transcript_height = 0;
  genes = [];
  // gene groups mapping gene name to upper and lower y coordinates in the plot
  gridConfig = {
    columns: 1,
    columnRatios: [1],
    rowRatiosPerColumn: [
      []
    ]
  };
  grid;
  constructor(svgElement, data) {
    this.svg = svgElement;
    this.dimensions = data.dimensions;
    this.transcriptome = data.transcriptome;
    this.transcript_height = this.dimensions.height / this.transcriptome.numTranscripts();
    this.genes = [];
    const transcript_ratio = 1 / this.transcriptome.numTranscripts();
    for (const _ of this.transcriptome) {
      this.gridConfig.rowRatiosPerColumn[0].push(transcript_ratio);
    }
    this.grid = new D3Grid(this.svg, this.dimensions.height, this.dimensions.width, this.gridConfig);
  }
  plot() {
    let tx_idx = 0;
    for (const [gene_id, transcripts] of this.transcriptome.genes()) {
      const svg_coordinates = this.grid.getCellCoordinates(0, tx_idx);
      const y_pos = svg_coordinates?.y || 0;
      this.genes.push({ "name": gene_id, "y": [y_pos, y_pos + transcripts.length * this.transcript_height] });
      for (const transcript of transcripts) {
        const txPlotSvg = this.grid.getCellSvg(0, tx_idx);
        if (txPlotSvg) {
          const svg_dimensions = this.grid.getCellDimensions(0, tx_idx);
          const svg_coordinates2 = this.grid.getCellCoordinates(0, tx_idx);
          const txPlotDimensions = {
            width: svg_dimensions?.width || 0,
            height: svg_dimensions?.height || 0,
            x: svg_coordinates2?.x || 0,
            y: svg_coordinates2?.y || 0,
            fontSize: this.dimensions.fontSize
          };
          const txPlot = new TranscriptPlot(txPlotSvg, {
            dimensions: txPlotDimensions,
            genome_length: this.transcriptome.getEnd(),
            transcript
          });
          txPlot.plot();
        }
        tx_idx += 1;
      }
    }
    console.log(this.genes);
    return this.genes;
  }
};
var TranscriptomePlotLabels = class {
  svg;
  dimensions;
  genes;
  constructor(svg, data) {
    this.svg = svg;
    this.dimensions = data.dimensions;
    this.genes = data.genes;
  }
  createCurlyBracePath(y0, y1) {
    const braceWidth = this.dimensions["width"] / 4;
    const height = y1 - y0;
    const scaledPath = `
            M 0,${y0}
            C ${braceWidth / 2},${y0} 0,${y0 + height / 2} ${braceWidth},${y0 + height / 2}
            C 0,${y0 + height / 2} ${braceWidth / 2},${y1} 0,${y1}
            
        `;
    return scaledPath;
  }
  plot() {
    this.genes.forEach((gene) => {
      const gene_y = gene["y"][0] + (gene["y"][1] - gene["y"][0]) / 2;
      this.svg.append("text").attr("x", this.dimensions["width"] / 2).attr("y", gene_y).attr("text-anchor", "middle").style("fill", "black").style("font-size", this.dimensions["fontSize"] + "px").text(gene["name"]);
      this.svg.append("path").attr("d", this.createCurlyBracePath(gene["y"][0], gene["y"][1])).attr("stroke", "black").attr("fill", "none");
    });
  }
};

// src/utils/plots/BarPlot.ts
var d3 = __toESM(require("d3"));
var BarPlot = class {
  svg;
  dimensions;
  bedData;
  xScale;
  yScale;
  useProvidedYScale = false;
  color;
  barWidth;
  // New property to store bar width
  constructor(svg, data) {
    this.svg = svg;
    this.dimensions = data.dimensions;
    this.bedData = data.bedData;
    this.xScale = data.xScale;
    this.color = data.color;
    this.yScale = data.yScale ?? d3.scaleLinear();
    this.useProvidedYScale = data.yScale !== void 0;
    this.barWidth = data.barWidth ?? 5;
  }
  get_yScale() {
    return this.yScale;
  }
  plot() {
    if (!this.useProvidedYScale) {
      this.yScale = d3.scaleLinear().domain([0, this.bedData.maxScore()]).range([this.dimensions.height, 0]);
    }
    this.svg.append("rect").attr("class", "grid-background").attr("x", 0).attr("y", 0).attr("width", this.dimensions.width).attr("height", this.dimensions.height).attr("fill", "#f7f7f7").attr("fill-opacity", 0.75);
    this.svg.append("g").attr("class", "grid").attr("stroke", "rgba(0, 0, 0, 0.1)").attr("stroke-width", 1).attr("stroke-dasharray", "5,5").attr("opacity", 0.3).call(d3.axisLeft(this.yScale).ticks(2).tickSize(-this.dimensions.width).tickFormat(null));
    this.svg.selectAll(".bar").data(this.bedData.getData()).enter().append("rect").attr("class", "bar").attr("x", (d) => {
      const barStart = this.xScale(d.start);
      const totalWidth = this.xScale(d.end) - this.xScale(d.start);
      return barStart + (totalWidth - this.barWidth) / 2;
    }).attr("y", (d) => this.yScale(d.score)).attr("width", this.barWidth).attr("height", (d) => this.dimensions.height - this.yScale(d.score)).attr("fill", this.color);
  }
};

// src/utils/plots/LinePlot.ts
var d32 = __toESM(require("d3"));
var LinePlot = class {
  svg;
  dimensions;
  bedData;
  xScale;
  yScale;
  useProvidedYScale = false;
  color;
  constructor(svg, data) {
    this.svg = svg;
    this.dimensions = data.dimensions;
    this.bedData = data.bedData;
    this.xScale = data.xScale;
    this.color = data.color;
    this.yScale = data.yScale ?? d32.scaleLinear();
    this.useProvidedYScale = data.yScale !== void 0;
  }
  get_yScale() {
    return this.yScale;
  }
  plot() {
    if (!this.useProvidedYScale) {
      this.yScale = d32.scaleLinear().domain([0, this.bedData.maxScore()]).range([this.dimensions.height, 0]);
    }
    this.svg.append("rect").attr("class", "grid-background").attr("x", 0).attr("y", 0).attr("width", this.dimensions.width).attr("height", this.dimensions.height).attr("fill", "#f7f7f7").attr("fill-opacity", 0.75);
    this.svg.append("g").attr("class", "grid").attr("stroke", "rgba(0, 0, 0, 0.1)").attr("stroke-width", 1).attr("stroke-dasharray", "5,5").attr("opacity", 0.3).call(
      d32.axisLeft(this.yScale).ticks(2).tickSize(-this.dimensions.width).tickFormat(null)
    );
    const lineData = this.bedData.getData().flatMap((d) => {
      const points = [];
      for (let pos = d.start; pos < d.end; pos++) {
        points.push({ x: this.xScale(pos), y: this.yScale(d.score) });
      }
      return points;
    });
    const lineGenerator = d32.line().x((d) => d.x).y((d) => d.y).curve(d32.curveMonotoneX);
    this.svg.append("path").datum(lineData).attr("class", "line").attr("d", lineGenerator).attr("fill", "none").attr("stroke", this.color).attr("stroke-width", 2);
    this.svg.selectAll(".point").data(lineData).enter().append("circle").attr("class", "point").attr("cx", (d) => d.x).attr("cy", (d) => d.y).attr("r", 3).attr("fill", this.color);
  }
};

// src/utils/plots/SequenceLogo.tsx
var d33 = __toESM(require("d3"));
var SequenceLogo = class {
  svg;
  dimensions;
  sjData;
  xScale;
  yScale;
  useProvidedYScale = false;
  colors;
  baseWidth;
  constructor(svg, data) {
    this.svg = svg;
    this.dimensions = data.dimensions;
    this.sjData = data.sjData.data;
    this.xScale = data.xScale;
    this.colors = data.colors ?? {
      "A": "#32CD32",
      // Green
      "C": "#1E90FF",
      // Blue
      "G": "#FFD700",
      // Gold
      "T": "#DC143C",
      // Crimson
      "N": "#808080"
      // Gray
    };
    this.yScale = data.yScale ?? d33.scaleLinear();
    this.useProvidedYScale = data.yScale !== void 0;
    const uniquePositions = new Set(this.sjData.map((d) => d.position)).size / 2;
    this.baseWidth = this.dimensions.width / uniquePositions;
  }
  get_yScale() {
    return this.yScale;
  }
  getNucleotideCounts(position) {
    return {
      "A": position.A,
      "C": position.C,
      "G": position.G,
      "T": position.T,
      "N": position.N
    };
  }
  calculateRelativeHeights(counts) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    if (total === 0) return {};
    return Object.entries(counts).reduce((acc, [key, value]) => {
      acc[key] = value / total;
      return acc;
    }, {});
  }
  createScaledLetter(nuc, x, yPosition, letterHeight) {
    const letterGroup = this.svg.append("g").attr("transform", `translate(${x}, ${yPosition})`);
    const scaleY = letterHeight / this.baseWidth;
    letterGroup.append("text").attr("text-anchor", "bottom").attr("dominant-baseline", "hanging").attr("fill", this.colors[nuc]).attr("font-family", "monospace").attr("font-weight", "bold").attr("font-size", `${this.baseWidth}px`).attr("transform", `scale(1, ${scaleY})`).attr("transform-origin", "0 0").text(nuc);
  }
  createBackgroundRect() {
    this.svg.append("rect").attr("class", "grid-background").attr("x", 0).attr("y", 0).attr("width", this.dimensions.width).attr("height", this.dimensions.height).attr("fill", "none").attr("stroke", "black").attr("stroke-width", "3");
  }
  plot() {
    this.svg.selectAll("*").remove();
    this.createBackgroundRect();
    if (!this.useProvidedYScale) {
      this.yScale = d33.scaleLinear().domain([0, 1]).range([this.dimensions.height, 0]);
    }
    const sortedData = [...this.sjData].sort((a, b) => a.position - b.position);
    const nucleotideOrder = ["A", "C", "G", "T", "N"];
    sortedData.forEach((position) => {
      const x = this.xScale(position.position);
      const counts = this.getNucleotideCounts(position);
      const relativeHeights = this.calculateRelativeHeights(counts);
      let yOffset = this.dimensions.height;
      console.log(yOffset);
      nucleotideOrder.forEach((nuc) => {
        if (counts[nuc] > 0) {
          const frequency = relativeHeights[nuc];
          const letterHeight = this.dimensions.height * frequency;
          this.createScaledLetter(nuc, x, yOffset - letterHeight, letterHeight);
          yOffset -= letterHeight;
        }
      });
    });
  }
};

// src/utils/plots/BoxPlot.ts
var d34 = __toESM(require("d3"));
var BoxPlot = class {
  svg;
  dimensions;
  bedData;
  xScale;
  yScale;
  useProvidedYScale = false;
  boxWidth;
  colors;
  showOutliers;
  // Store the setting for showing outliers
  constructor(svg, data) {
    this.svg = svg;
    this.dimensions = data.dimensions;
    this.bedData = data.bedData.data;
    this.xScale = data.xScale;
    this.colors = data.colors ?? {
      box: "#69b3a2",
      median: "#000000",
      whisker: "#000000",
      outlier: "#e8504c"
    };
    this.yScale = data.yScale ?? d34.scaleLinear();
    this.useProvidedYScale = data.yScale !== void 0;
    this.showOutliers = data.showOutliers ?? true;
    const uniquePositions = /* @__PURE__ */ new Set();
    this.bedData.getData().forEach((d) => {
      for (let pos = d.start; pos < d.end; pos++) {
        uniquePositions.add(pos);
      }
    });
    const numPositions = uniquePositions.size;
    this.boxWidth = data.boxWidth ?? this.dimensions.width / (numPositions * 2);
  }
  get_yScale() {
    return this.yScale;
  }
  calculateBoxStats(position) {
    const linesAtPosition = this.bedData.getPos(position);
    if (linesAtPosition.length === 0) {
      return null;
    }
    const scores = linesAtPosition.map((line2) => line2.score);
    if (scores.length === 0) {
      return null;
    }
    scores.sort((a, b) => a - b);
    const min2 = d34.min(scores) ?? 0;
    const max2 = d34.max(scores) ?? 0;
    const q1 = d34.quantile(scores, 0.25) ?? min2;
    const median = d34.quantile(scores, 0.5) ?? (min2 + max2) / 2;
    const q3 = d34.quantile(scores, 0.75) ?? max2;
    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;
    const outliers = scores.filter((score) => score < lowerFence || score > upperFence);
    const filteredScores = scores.filter((score) => score >= lowerFence && score <= upperFence);
    const adjustedMin = filteredScores.length > 0 ? d34.min(filteredScores) ?? min2 : min2;
    const adjustedMax = filteredScores.length > 0 ? d34.max(filteredScores) ?? max2 : max2;
    return {
      min: adjustedMin,
      q1,
      median,
      q3,
      max: adjustedMax,
      outliers,
      position
    };
  }
  drawBoxPlot(stats) {
    const x = this.xScale(stats.position);
    const center = x;
    const width = this.boxWidth;
    this.svg.append("rect").attr("x", center - width / 2).attr("y", this.yScale(stats.q3)).attr("width", width).attr("height", this.yScale(stats.q1) - this.yScale(stats.q3)).attr("fill", this.colors.box).attr("stroke", "black").attr("stroke-width", 1);
    this.svg.append("line").attr("x1", center - width / 2).attr("x2", center + width / 2).attr("y1", this.yScale(stats.median)).attr("y2", this.yScale(stats.median)).attr("stroke", this.colors.median).attr("stroke-width", 2);
    this.svg.append("line").attr("x1", center).attr("x2", center).attr("y1", this.yScale(stats.q1)).attr("y2", this.yScale(stats.min)).attr("stroke", this.colors.whisker).attr("stroke-width", 1);
    this.svg.append("line").attr("x1", center - width / 4).attr("x2", center + width / 4).attr("y1", this.yScale(stats.min)).attr("y2", this.yScale(stats.min)).attr("stroke", this.colors.whisker).attr("stroke-width", 1);
    this.svg.append("line").attr("x1", center).attr("x2", center).attr("y1", this.yScale(stats.q3)).attr("y2", this.yScale(stats.max)).attr("stroke", this.colors.whisker).attr("stroke-width", 1);
    this.svg.append("line").attr("x1", center - width / 4).attr("x2", center + width / 4).attr("y1", this.yScale(stats.max)).attr("y2", this.yScale(stats.max)).attr("stroke", this.colors.whisker).attr("stroke-width", 1);
    if (this.showOutliers) {
      stats.outliers.forEach((outlier) => {
        this.svg.append("circle").attr("cx", center).attr("cy", this.yScale(outlier)).attr("r", 3).attr("fill", this.colors.outlier);
      });
    }
  }
  plot() {
    this.svg.selectAll("*").remove();
    if (!this.useProvidedYScale) {
      const allScores = this.bedData.getData().map((d) => d.score);
      const minScore = d34.min(allScores) ?? 0;
      const maxScore = d34.max(allScores) ?? 1;
      const padding = (maxScore - minScore) * 0.1;
      this.yScale = d34.scaleLinear().domain([minScore - padding, maxScore + padding]).range([this.dimensions.height, 0]);
    }
    const positions = /* @__PURE__ */ new Set();
    this.bedData.getData().forEach((line2) => {
      for (let pos = line2.start; pos < line2.end; pos++) {
        positions.add(pos);
      }
    });
    Array.from(positions).sort((a, b) => a - b).forEach((position) => {
      const stats = this.calculateBoxStats(position);
      if (stats) {
        this.drawBoxPlot(stats);
      }
    });
  }
};

// src/utils/plots/DataPlotArray.ts
var d35 = __toESM(require("d3"));
var DataPlotArray = class {
  svg;
  dimensions;
  elements;
  elementWidth;
  coordinateLength;
  maxValue;
  yScale;
  raw_xs;
  // positions of the elements before spreading
  spread_elements;
  // positions of the elements on the transformed grid
  element_indices;
  // indices of the elements in the grid
  gridConfig = {
    columns: 0,
    columnRatios: [],
    rowRatiosPerColumn: []
  };
  grid;
  constructor(data) {
    this.svg = data.svg;
    this.dimensions = data.dimensions;
    this.elements = data.elements;
    this.elementWidth = data.elementWidth;
    this.coordinateLength = data.coordinateLength;
    this.maxValue = data.maxValue;
    this.yScale = d35.scaleLinear();
    this.raw_xs = [];
    this.spread_elements = [];
    this.build_xs();
    this.element_indices = [];
    this.gridConfig = {
      columns: 0,
      columnRatios: [],
      rowRatiosPerColumn: []
    };
    this.grid = this.build_grid();
  }
  build_xs() {
    let spread_xs = [];
    this.elements.forEach((elem) => {
      const percent_position = elem / this.coordinateLength * this.dimensions["width"];
      const interval_start = percent_position - this.elementWidth / 2;
      const interval_end = percent_position + this.elementWidth / 2;
      this.raw_xs.push([interval_start, interval_end]);
      spread_xs.push([interval_start, interval_end]);
    });
    this.spread_elements = adjustIntervals(spread_xs, 1, this.dimensions["width"], 25);
  }
  build_grid() {
    let spacer_start = 0;
    let spacer_end = 0;
    let elem_idx = 0;
    this.spread_elements.forEach((interval) => {
      spacer_end = interval[0];
      if (interval[0] !== 0) {
        const spacer_width = spacer_end - spacer_start;
        this.gridConfig.columnRatios.push(spacer_width / this.dimensions["width"]);
        this.gridConfig.rowRatiosPerColumn.push([1]);
        this.gridConfig.columns += 1;
        elem_idx += 1;
      }
      spacer_start = interval[1];
      const element_width = interval[1] - interval[0];
      this.gridConfig.columnRatios.push(element_width / this.dimensions["width"]);
      this.gridConfig.rowRatiosPerColumn.push([1]);
      this.gridConfig.columns += 1;
      this.element_indices.push(elem_idx);
      elem_idx += 1;
    });
    if (spacer_end !== this.dimensions["width"]) {
      const spacer_width = this.dimensions["width"] - spacer_start;
      this.gridConfig.columnRatios.push(spacer_width / this.dimensions["width"]);
      this.gridConfig.rowRatiosPerColumn.push([1]);
      this.gridConfig.columns += 1;
    }
    return new D3Grid(this.svg, this.dimensions.height, this.dimensions.width, this.gridConfig);
  }
  plot() {
    this.yScale = d35.scaleLinear().domain([0, this.maxValue]).range([this.dimensions.height, 0]);
    this.svg.insert("rect", ":first-child").attr("class", "grid-background").attr("x", 0).attr("y", 0).attr("width", this.dimensions.width).attr("height", this.dimensions.height).attr("fill", "#f7f7f7").attr("fill-opacity", 0.75);
    this.svg.insert("g", ":first-child").attr("class", "grid").attr("stroke", "rgba(0, 0, 0, 0.1)").attr("stroke-width", 1).attr("stroke-dasharray", "5,5").attr("opacity", 0.5).call(d35.axisLeft(this.yScale).ticks(5).tickSize(-this.dimensions.width).tickFormat(null));
  }
  getElementSVG(index) {
    const elem_idx = this.element_indices[index];
    if (elem_idx === -1) {
      return void 0;
    }
    return this.grid.getCellSvg(elem_idx, 0);
  }
  getCellDimensions(index) {
    const elem_idx = this.element_indices[index];
    if (elem_idx === -1) {
      return void 0;
    }
    return this.grid.getCellDimensions(elem_idx, 0);
  }
  getCellCoordinates(index) {
    const elem_idx = this.element_indices[index];
    if (elem_idx === -1) {
      return void 0;
    }
    return this.grid.getCellCoordinates(elem_idx, 0);
  }
  getYScale() {
    return this.yScale;
  }
  // compute corresponding x-axis positions for the element
  getElementMapping(index) {
    return [this.raw_xs[index], this.spread_elements[index]];
  }
};

// src/utils/plots/TriangleConnector.ts
var TriangleConnector = class {
  svg;
  dimensions;
  points;
  color = "#000000";
  constructor(data) {
    this.svg = data.svg;
    this.dimensions = data.dimensions;
    this.points = data.points;
    this.color = data.color;
  }
  plot() {
    this.svg.append("polygon").attr("points", `${this.points.top},${0} ${this.points.left},${this.dimensions.height} ${this.points.right},${this.dimensions.height}`).attr("fill", "none").attr("fill", this.color).attr("fill-opacity", 0.025).attr("stroke", this.color).attr("stroke-opacity", 0.15).attr("stroke-width", 1);
    this.svg.append("line").attr("x1", this.points.top).attr("y1", 0).attr("x2", this.points.mid).attr("y2", this.dimensions.height).attr("stroke", this.color).attr("stroke-width", 1).attr("stroke-dasharray", "5,5");
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  BarPlot,
  BedData,
  BoxPlot,
  CDS,
  D3Grid,
  DataPlotArray,
  Exon,
  FaiData,
  GenomePlot,
  IntegrationsData,
  LinePlot,
  ORFPlot,
  PathogenPlot,
  SJData,
  Sequence,
  SequenceLogo,
  Transcript,
  Transcriptome,
  TranscriptomePlot,
  TranscriptomePlotLabels,
  TriangleConnector,
  adjustIntervals,
  computeMidpoint,
  parseBed,
  parseFai,
  parseIntegrations,
  parseSJ
});
//# sourceMappingURL=index.js.map