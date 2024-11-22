export class BedData {
    data;
    constructor() {
        this.data = [];
    }
    addLine(line) {
        this.data.push(line);
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
        return Math.max(...this.data.map(d => d.score));
    }
    getData() {
        return this.data;
    }
    getPos(pos) {
        return this.data.filter(d => d.start <= pos && d.end >= pos);
    }
    getRange(start, end) {
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
    explode() {
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
//# sourceMappingURL=types.js.map