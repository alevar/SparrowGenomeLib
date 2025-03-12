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

    public smooth(windowSize: number): BedData {
        // First explode the data to get individual positions
        const explodedData = this.explode();
        const explodedLines = explodedData.getData();
        
        // Sort the exploded data by position
        explodedLines.sort((a, b) => {
          // First sort by seqid
          if (a.seqid !== b.seqid) {
            return a.seqid.localeCompare(b.seqid);
          }
          // Then by strand
          if (a.strand !== b.strand) {
            return a.strand.localeCompare(b.strand);
          }
          // Finally by start position
          return a.start - b.start;
        });
        
        // Initialize result
        const smoothedData = new BedData();
        
        // If there's no data, return empty result
        if (explodedLines.length === 0) {
          return smoothedData;
        }
        
        // Group data by seqid+strand combination
        const seqidStrandGroups = new Map<string, BedLine[]>();
        
        // Create groups
        explodedLines.forEach(line => {
          const key = `${line.seqid}|${line.strand}`;
          if (!seqidStrandGroups.has(key)) {
            seqidStrandGroups.set(key, []);
          }
          seqidStrandGroups.get(key)!.push(line);
        });
        
        // Process each seqid+strand group separately
        seqidStrandGroups.forEach((linesInGroup, key) => {
          // Get seqid and strand from the key
          const [seqid, strand] = key.split('|');
          
          // Get min and max positions for this group
          const minPos = Math.min(...linesInGroup.map(d => d.start));
          const maxPos = Math.max(...linesInGroup.map(d => d.end));
          
          // Group data by position within this seqid+strand group
          const positionGroups = new Map<number, BedLine[]>();
          
          // Organize data by position
          linesInGroup.forEach(line => {
            if (!positionGroups.has(line.start)) {
              positionGroups.set(line.start, []);
            }
            positionGroups.get(line.start)!.push(line);
          });
          
          // Process each window position for this seqid+strand group
          for (let pos = minPos; pos < maxPos - windowSize + 1; pos++) {
            // Calculate the window boundaries
            const windowEnd = pos + windowSize;
            
            // Collect all scores within the window
            const scores: number[] = [];
            
            // Gather data for all positions in the window
            for (let i = pos; i < windowEnd; i++) {
              if (positionGroups.has(i)) {
                const linesAtPos = positionGroups.get(i)!;
                
                // Add all scores at this position
                linesAtPos.forEach(line => {
                  scores.push(line.score);
                });
              }
            }
            
            // Skip if no data in window
            if (scores.length === 0) continue;
            
            // Calculate the mean score
            const meanScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
            
            // Create a new smoothed line
            smoothedData.addLine({
              seqid: seqid,
              start: pos,
              end: windowEnd,
              score: meanScore,
              name: `smoothed_${seqid}_${strand}_${pos}_${windowEnd}`,
              strand: strand
            });
          }
        });
        
        return smoothedData;
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