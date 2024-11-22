import { BedData } from '../../types';
export function parseBed(bedFileName) {
    return new Promise((resolve, reject) => {
        const bedFile = {
            data: new BedData(),
            fileName: bedFileName.name,
            status: 1,
        };
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const result = e.target?.result;
                const lines = result.split('\n');
                lines.forEach((line) => {
                    // skip empty lines
                    if (line.trim() === '') {
                        return;
                    }
                    const fields = line.split('\t');
                    if (fields.length === 6) {
                        const [seqid, start, end, name, score, strand] = fields;
                        const bedLine = {
                            seqid: seqid,
                            start: parseInt(start),
                            end: parseInt(end),
                            name: name,
                            score: parseFloat(score),
                            strand: strand,
                        };
                        bedFile.data.addLine(bedLine);
                    }
                    else {
                        throw new Error(`Invalid line format: ${line}`);
                    }
                });
                resolve(bedFile);
            }
            catch (error) {
                reject(new Error('Failed to parse BED file'));
            }
        };
        reader.onerror = () => {
            reject(new Error('Failed to read the file'));
        };
        reader.readAsText(bedFileName);
    });
}
//# sourceMappingURL=parsers.js.map