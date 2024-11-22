export class D3Grid {
    height;
    width;
    gridConfig;
    svg;
    cellDimensions_raw;
    cellDimensions;
    cellCoordinates;
    cellData; // holds any data associated with each cell
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
        this.svg = svg
            .attr('width', this.width)
            .attr('height', this.height);
        // Setup grid
        this.setupGrid();
    }
    setupGrid() {
        const totalColumnRatio = this.gridConfig.columnRatios.reduce((sum, ratio) => sum + ratio, 0);
        let xOffset = 0;
        this.gridConfig.columnRatios.forEach((colRatio, colIndex) => {
            const columnWidth = (colRatio / totalColumnRatio) * this.width;
            const totalRowRatio = this.gridConfig.rowRatiosPerColumn[colIndex].reduce((sum, ratio) => sum + ratio, 0);
            this.cellDimensions_raw[colIndex] = [];
            this.cellDimensions[colIndex] = [];
            this.cellCoordinates[colIndex] = [];
            this.cellData[colIndex] = [];
            this.cellSvgs[colIndex] = [];
            let yOffset = 0;
            this.gridConfig.rowRatiosPerColumn[colIndex].forEach((rowRatio, rowIndex) => {
                const rowHeight = (rowRatio / totalRowRatio) * this.height;
                const paddedWidth = columnWidth;
                const paddedHeight = rowHeight;
                this.cellDimensions_raw[colIndex][rowIndex] = { width: columnWidth, height: rowHeight };
                this.cellDimensions[colIndex][rowIndex] = { width: paddedWidth, height: paddedHeight };
                this.cellCoordinates[colIndex][rowIndex] = { x: xOffset, y: yOffset };
                this.cellData[colIndex][rowIndex] = {};
                const new_svg = this.svg.append('svg')
                    .attr('x', xOffset)
                    .attr('y', yOffset)
                    .attr('width', columnWidth)
                    .attr('height', rowHeight);
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
        return undefined;
    }
    getCellSvg(colIndex, rowIndex) {
        return this.cellSvgs[colIndex]?.[rowIndex];
    }
    createOverlaySvg(colIndex, rowIndices) {
        // Determine the combined height and position based on the rows to be combined
        const combinedHeight = rowIndices.reduce((sum, rowIndex) => sum + this.cellDimensions_raw[colIndex][rowIndex].height, 0);
        const firstRowIndex = rowIndices[0];
        const firstCellCoords = this.getCellCoordinates_unpadded(colIndex, firstRowIndex);
        const combinedWidth = this.cellDimensions[colIndex][firstRowIndex].width;
        // Create a new SVG for the overlay
        const overlaySvg = this.svg.append('svg')
            .attr('x', firstCellCoords?.x || 0) // Use 0 as default if x is undefined
            .attr('y', firstCellCoords?.y || 0) // Use 0 as default if y is undefined
            .attr('width', combinedWidth)
            .attr('height', combinedHeight)
            .style('pointer-events', 'none'); // Make sure the overlay doesn't block interactions with underlying SVGs
        return overlaySvg;
    }
    promote(colIndex, rowIndex) {
        const cellSvg = this.getCellSvg(colIndex, rowIndex);
        if (cellSvg) {
            cellSvg.raise();
        }
    }
}
//# sourceMappingURL=plotGrid.js.map