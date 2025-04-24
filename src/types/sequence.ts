class Sequence {
    private sequences: Map<string, string> = new Map();
    private primarySeqId: string = "";
    private length: number = 0;
    private source_file?: string;

    constructor() {
        // Initialize empty sequence
    }

    /**
     * Create a Sequence instance from a FASTA file
     */
    static async create(file: File): Promise<Sequence> {
        const instance = new Sequence();
        await instance.parseFastaFile(file);
        instance.source_file = file.name;
        return instance;
    }

    /**
     * Parse a FASTA file and populate the sequences map
     */
    private parseFastaFile(fastaFile: File): Promise<void> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = e.target?.result as string;
                    const lines = result.split('\n');
                    
                    let currentSeqId = "";
                    let currentSequence = "";
                    
                    // Process each line
                    for (const line of lines) {
                        if (line.trim() === "") continue;
                        
                        if (line.startsWith('>')) {
                            // Process previous sequence if exists
                            if (currentSeqId && currentSequence) {
                                this.sequences.set(currentSeqId, currentSequence);
                                
                                // Set first sequence as primary if not set
                                if (!this.primarySeqId) {
                                    this.primarySeqId = currentSeqId;
                                    this.length = currentSequence.length;
                                }
                            }
                            
                            // Start new sequence
                            currentSeqId = line.substring(1).trim().split(/\s+/)[0]; // Get ID part before first whitespace
                            currentSequence = "";
                        } else {
                            // Append sequence data
                            currentSequence += line.trim().toUpperCase();
                        }
                    }
                    
                    // Add the last sequence
                    if (currentSeqId && currentSequence) {
                        this.sequences.set(currentSeqId, currentSequence);
                        
                        // Set first sequence as primary if not set
                        if (!this.primarySeqId) {
                            this.primarySeqId = currentSeqId;
                            this.length = currentSequence.length;
                        }
                    }
                    
                    // Verify that we have at least one sequence
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
                console.error('Failed to read the file');
                reject(new Error('Failed to read the file'));
            };
            
            reader.readAsText(fastaFile);
        });
    }

    /**
     * Get the DNA sequence for a specific region
     */
    getSubsequence(start: number, end: number, seqId?: string): string {
        const id = seqId || this.primarySeqId;
        const sequence = this.sequences.get(id);
        
        if (!sequence) {
            throw new Error(`Sequence with ID ${id} not found`);
        }
        
        if (start < 1 || end > sequence.length || start > end) {
            throw new Error(`Invalid coordinates: start=${start}, end=${end}, sequence length=${sequence.length}`);
        }
        
        // Convert from 1-based to 0-based indexing
        return sequence.substring(start - 1, end);
    }

    /**
     * Get the entire sequence for a specified seqId
     */
    getSequence(seqId?: string): string {
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
    getReverseComplement(seqId?: string): string {
        const sequence = this.getSequence(seqId);
        return this.reverseComplement(sequence);
    }

    /**
     * Helper function to get reverse complement of a DNA string
     */
    private reverseComplement(seq: string): string {
        const complement: {[key: string]: string} = {
            'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G',
            'a': 't', 't': 'a', 'g': 'c', 'c': 'g',
            'N': 'N', 'n': 'n'
        };
        
        return seq
            .split('')
            .reverse()
            .map(base => complement[base] || base)
            .join('');
    }

    /**
     * Get sequence IDs
     */
    getSequenceIds(): string[] {
        return Array.from(this.sequences.keys());
    }

    /**
     * Get primary sequence ID
     */
    getPrimarySequenceId(): string {
        return this.primarySeqId;
    }

    /**
     * Set primary sequence ID
     */
    setPrimarySequenceId(seqId: string): void {
        if (!this.sequences.has(seqId)) {
            throw new Error(`Sequence with ID ${seqId} not found`);
        }
        this.primarySeqId = seqId;
        this.length = this.sequences.get(seqId)?.length || 0;
    }

    /**
     * Get length of the sequence
     */
    getLength(seqId?: string): number {
        if (seqId) {
            const seq = this.sequences.get(seqId);
            return seq ? seq.length : 0;
        }
        return this.length;
    }

    /**
     * Get source file name
     */
    getSourceFile(): string | undefined {
        return this.source_file;
    }

    /**
     * Check if sequence contains a specific seqId
     */
    hasSequence(seqId: string): boolean {
        return this.sequences.has(seqId);
    }

    /**
     * Get GC content of a sequence
     */
    getGCContent(seqId?: string): number {
        const sequence = this.getSequence(seqId);
        if (!sequence || sequence.length === 0) return 0;
        
        const gcCount = (sequence.match(/[GC]/gi) || []).length;
        return gcCount / sequence.length;
    }

    /**
     * Translate DNA sequence to protein (basic implementation)
     */
    translateToProtein(start: number, end: number, seqId?: string): string {
        const dnaSeq = this.getSubsequence(start, end, seqId);
        
        // Genetic code
        const geneticCode: {[key: string]: string} = {
            'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
            'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
            'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
            'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
            'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
            'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
            'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
            'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
            'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
            'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
            'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
            'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
            'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
            'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
            'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
            'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G'
        };
        
        let protein = '';
        
        // Translate each codon
        for (let i = 0; i < dnaSeq.length; i += 3) {
            if (i + 3 > dnaSeq.length) break; // Incomplete codon
            
            const codon = dnaSeq.substring(i, i + 3).toUpperCase();
            protein += geneticCode[codon] || 'X'; // X for unknown codons
        }
        
        return protein;
    }

    /**
     * Calculate nucleotide frequencies
     */
    getNucleotideFrequencies(seqId?: string): Record<string, number> {
        const sequence = this.getSequence(seqId).toUpperCase();
        const frequencies: Record<string, number> = { A: 0, C: 0, G: 0, T: 0, N: 0, Other: 0 };
        
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
    getSummary(seqId?: string): Record<string, any> {
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
}

export { Sequence };