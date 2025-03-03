import { IntegrationsFile, IntegrationsData, IntegrationsLine, FaiFile, FaiData, FaiLine, SJFile, SJData, SJLine, BedFile, BedData, BedLine } from '../../types';

export function parseBed(bedFileName: File): Promise<BedFile> {
    return new Promise((resolve, reject) => {
        const bedFile: BedFile = {
            data: new BedData(),
            fileName: bedFileName.name,
            status: 1,
        };
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const lines = result.split('\n');
                lines.forEach((line) => {
                    // skip empty lines
                    if (line.trim() === '') {
                        return;
                    }
                    const fields = line.split('\t');
                    if (fields.length === 6) {
                        const [seqid, start, end, name, score, strand] = fields;
                        const bedLine: BedLine = {
                            seqid: seqid,
                            start: parseInt(start),
                            end: parseInt(end),
                            name: name,
                            score: parseFloat(score),
                            strand: strand,
                        };
                        bedFile.data.addLine(bedLine);
                    } else {
                        throw new Error(`Invalid line format: ${line}`);
                    }
                });
                resolve(bedFile);
            } catch (error) {
                reject(new Error('Failed to parse BED file'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Failed to read the file'));
        };
        reader.readAsText(bedFileName);
    });
}

export function parseSJ(sjFileName: File): Promise<SJFile> {
    return new Promise((resolve, reject) => {
        const sjFile: SJFile = {
            data: new SJData(),
            fileName: sjFileName.name,
            status: 1,
        };
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const lines = result.split('\n');
                // skip header line
                lines.forEach((line, idx) => {
                    if (idx === 0) {
                        return;
                    }
                    // skip empty lines
                    if (line.trim() === '') {
                        return;
                    }
                    const fields = line.split('\t');
                    if (fields.length === 7) {
                        const [seqid, position, A, C, G, T, N] = fields;
                        const sjLine: SJLine = {
                            seqid: seqid,
                            position: parseInt(position),
                            A: parseInt(A),
                            C: parseInt(C),
                            G: parseInt(G),
                            T: parseInt(T),
                            N: parseInt(N),
                        };
                        sjFile.data.addLine(sjLine);
                    } else {
                        throw new Error(`Invalid line format: ${line}`);
                    }
                });
                resolve(sjFile);
            } catch (error) {
                reject(new Error('Failed to parse SJ file'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Failed to read the file'));
        };
        reader.readAsText(sjFileName);
    });
}

export function parseFai(faiFileName: File): Promise<FaiFile> {
    return new Promise((resolve, reject) => {
        const faiFile: FaiFile = {
            data: new FaiData(),
            fileName: faiFileName.name,
            status: 1,
        };
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const lines = result.split('\n');
                lines.forEach((line) => {
                    // skip empty lines
                    if (line.trim() === '') {
                        return;
                    }
                    const fields = line.split('\t');
                    if (fields.length === 5) {
                        const [seqid, seq_length, offset, lineBases, lineBytes] = fields;
                        
                        const faiLine: FaiLine = {
                            seqid: seqid,
                            seq_length: parseInt(seq_length),
                            offset: parseInt(offset),
                            lineBases: parseInt(lineBases),
                            lineBytes: parseInt(lineBytes),
                        };
                        faiFile.data.addLine(faiLine);
                    } else {
                        throw new Error(`Invalid line format: ${line}`);
                    }
                });
                resolve(faiFile);
            } catch (error) {
                reject(new Error('Failed to parse Fasta Index file'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Failed to read the file'));
        };
        reader.readAsText(faiFileName);
    });
}

export function parseIntegrations(integrationsFileName: File): Promise<IntegrationsFile> {
    return new Promise((resolve, reject) => {
        const integrationsFile: IntegrationsFile = {
            data: new IntegrationsData(),
            fileName: integrationsFileName.name,
            status: 1,
        };
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result as string;
                const lines = result.split('\n');
                lines.forEach((line) => {
                    // skip empty lines
                    if (line.trim() === '') {
                        return;
                    }
                    const fields = line.split('\t');
                    if (fields.length === 8) {
                        const [seqid1, position1, seqid2, position2, score, junction1, junction2, gene1] = fields;

                        const integrationsLine: IntegrationsLine = {
                            seqid1: seqid1,
                            position1: parseInt(position1),
                            seqid2: seqid2,
                            position2: parseInt(position2),
                            score: parseInt(score),
                        };

                        // Add optional fields if they exist
                        if (junction1) integrationsLine.junction1 = junction1;
                        if (junction2) integrationsLine.junction2 = junction2;
                        if (gene1) integrationsLine.gene1 = gene1;

                        integrationsFile.data.addLine(integrationsLine);
                    } else {
                        throw new Error(`Invalid line format: ${line}`);
                    }
                });
                resolve(integrationsFile);
            } catch (error) {
                reject(new Error('Failed to parse Integrations file'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Failed to read the file'));
        };
        reader.readAsText(integrationsFileName);
    });
}