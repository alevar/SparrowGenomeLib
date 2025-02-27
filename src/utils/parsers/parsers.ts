import { SJFile, SJData, SJLine, BedFile, BedData, BedLine } from '../../types';

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
                lines.forEach((line) => {
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