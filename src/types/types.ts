export interface SJLine {
    seqid: string;
    position: number;
    A: number;
    C: number;
    G: number;
    T: number;
    N: number;
}

export class SJData {
    private data: SJLine[];

    constructor() {
        this.data = [];
    }

    public addLine(line: SJLine): void {
        this.data.push(line);
    }

    public sort(): void {
        this.data.sort((a, b) => a.position - b.position);
    }

    public getData(): SJLine[] {
        return this.data;
    }
}

export interface SJFile {
    data: SJData;
    fileName: string;
    status: 1 | 0 | -1; // valid | parsing | error
}

export interface BedLine {
    seqid: string;
    start: number;
    end: number;
    name: string;
    score: number;
    strand: string;
}

export class BedData {
    private data: BedLine[];

    constructor() {
        this.data = [];
    }

    public addLine(line: BedLine): void {
        this.data.push(line);
    }

    public get length(): number {
        return this.data.length;
    }

    public sort(): void {
        this.data.sort((a, b) => a.start - b.start);
    }

    public numEntries(): number {
        return this.data.length;
    }

    public maxScore(): number {
        return Math.max(...this.data.map(d => d.score));
    }

    public getData(): BedLine[] {
        return this.data;
    }

    public getPos(pos: number): BedLine[] {
        return this.data.filter(d => d.start <= pos && d.end >= pos);
    }

    public getRange(start: number, end: number): BedData {
        // construct a new BedData object consisting of the data within the range
        let new_data = new BedData();
        for (let i = 0; i < this.data.length; i++) {
            let line = this.data[i];
            if (line.start <= end && line.end > start) {
                // trim line to the range
                let new_line = Object.assign({}, line);
                new_line.start = Math.max(line.start, start);
                new_line.end = Math.min(line.end, end);
                new_data.addLine(new_line);
            }
        }
        return new_data;
    }

    public explode(): BedData {
        // explode the data into individual lines
        let new_data = new BedData();
        for (let i = 0; i < this.data.length; i++) {
            let line = this.data[i];
            for (let j = line.start; j < line.end; j++) { // Corrected to use half-open interval
                let new_line = { ...line }; // Use spread syntax for shallow copy
                new_line.start = j;
                new_line.end = j + 1; // Each exploded line represents one base
                new_data.addLine(new_line);
            }
        }
        return new_data;
    }
}

export interface BedFile {
    data: BedData;
    fileName: string;
    status: 1 | 0 | -1; // valid | parsing | error
}

export type Interval = [number, number];

export interface Dimensions {
    width: number;
    height: number;
    x: number;
    y: number;
    fontSize: number;
}


export interface FaiLine {
    seqid: string;
    seq_length: number;
    offset: number;
    lineBases: number;
    lineBytes: number;
}
export class FaiData {
    private data: FaiLine[];

    constructor() {
        this.data = [];
    }

    public addLine(line: FaiLine): void {
        this.data.push(line);
    }

    public get length(): number {
        return this.data.length;
    }

    public numEntries(): number {
        return this.data.length;
    }

    public getData(): FaiLine[] {
        return this.data;
    }
}

export interface FaiFile {
    data: FaiData;
    fileName: string;
    status: 1 | 0 | -1; // valid | parsing | error
}

export interface IntegrationsLine {
    seqid1: string;
    seqid2: string;
    position1: number;
    position2: number;
    score: number;
    junction1?: string;
    junction2?: string;
    gene1?: string;
}
export class IntegrationsData {
    private data: IntegrationsLine[];

    constructor() {
        this.data = [];
    }

    public addLine(line: IntegrationsLine): void {
        this.data.push(line);
    }

    public get length(): number {
        return this.data.length;
    }

    public numEntries(): number {
        return this.data.length;
    }

    public getData(): IntegrationsLine[] {
        return this.data;
    }
}
export interface IntegrationsFile {
    data: IntegrationsData;
    fileName: string;
    status: 1 | 0 | -1; // valid | parsing | error
}