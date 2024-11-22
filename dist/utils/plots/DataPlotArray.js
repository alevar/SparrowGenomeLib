import * as d3 from 'd3';
import { D3Grid } from '../../types';
import { adjustIntervals } from '../utils';
// sets up a grid for displaying multiple data plots
// keeps consistent scale across all plots
// provides a mapping of coordinates to x-axis positions on the global grid
// provides interface for insertind data plots into the grid
export class DataPlotArray {
    svg;
    dimensions;
    elements;
    elementWidth;
    coordinateLength;
    maxValue;
    yScale;
    raw_xs; // positions of the elements before spreading
    spread_elements; // positions of the elements on the transformed grid
    element_indices; // indices of the elements in the grid
    gridConfig = {
        columns: 0,
        columnRatios: [],
        rowRatiosPerColumn: [],
    };
    grid;
    constructor(data) {
        this.svg = data.svg;
        this.dimensions = data.dimensions;
        this.elements = data.elements;
        this.elementWidth = data.elementWidth;
        this.coordinateLength = data.coordinateLength;
        this.maxValue = data.maxValue;
        this.yScale = d3.scaleLinear();
        // compute mapping of x-axis positions to the grid
        this.raw_xs = [];
        this.spread_elements = [];
        this.build_xs();
        // setup the grid based on the coordinates
        this.element_indices = [];
        this.gridConfig = {
            columns: 0,
            columnRatios: [],
            rowRatiosPerColumn: [],
        };
        this.grid = this.build_grid();
    }
    build_xs() {
        let spread_xs = [];
        this.elements.forEach(elem => {
            const percent_position = (elem / this.coordinateLength) * this.dimensions["width"];
            const interval_start = percent_position - this.elementWidth / 2;
            const interval_end = percent_position + this.elementWidth / 2;
            this.raw_xs.push([interval_start, interval_end]);
            spread_xs.push([interval_start, interval_end]);
        });
        this.spread_elements = adjustIntervals(spread_xs, 1, this.dimensions["width"], 25);
    }
    build_grid() {
        // create a grid config based on the spread elements assinging them to their own columns
        // keep spacers between each cell
        let spacer_start = 0;
        let spacer_end = 0;
        let elem_idx = 0;
        this.spread_elements.forEach(interval => {
            // create spacer unless interval starts at 0
            spacer_end = interval[0];
            if (interval[0] !== 0) {
                const spacer_width = spacer_end - spacer_start;
                this.gridConfig.columnRatios.push(spacer_width / this.dimensions["width"]);
                this.gridConfig.rowRatiosPerColumn.push([1]);
                this.gridConfig.columns += 1;
                elem_idx += 1;
            }
            spacer_start = interval[1];
            // create element
            const element_width = interval[1] - interval[0];
            this.gridConfig.columnRatios.push(element_width / this.dimensions["width"]);
            this.gridConfig.rowRatiosPerColumn.push([1]);
            this.gridConfig.columns += 1;
            this.element_indices.push(elem_idx);
            elem_idx += 1;
        });
        // add final spacer
        if (spacer_end !== this.dimensions["width"]) {
            const spacer_width = this.dimensions["width"] - spacer_start;
            this.gridConfig.columnRatios.push(spacer_width / this.dimensions["width"]);
            this.gridConfig.rowRatiosPerColumn.push([1]);
            this.gridConfig.columns += 1;
        }
        return new D3Grid(this.svg, this.dimensions.height, this.dimensions.width, this.gridConfig);
    }
    plot() {
        // create background grid with horizontal lines based on the max value
        this.yScale = d3.scaleLinear()
            .domain([0, this.maxValue])
            .range([this.dimensions.height, 0]);
        // Add a background rectangle for the grid
        this.svg.append("rect")
            .attr("class", "grid-background")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.dimensions.width)
            .attr("height", this.dimensions.height)
            .attr("fill", "#f7f7f7")
            .attr("fill-opacity", 0.75);
        // Add horizontal grid lines
        this.svg.append("g")
            .attr("class", "grid")
            .attr("stroke", "rgba(0, 0, 0, 0.1)")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0.3)
            .call(d3.axisLeft(this.yScale)
            .ticks(5)
            .tickSize(-this.dimensions.width)
            .tickFormat(null));
    }
    getElementSVG(index) {
        const elem_idx = this.element_indices[index];
        if (elem_idx === -1) {
            return undefined;
        }
        return this.grid.getCellSvg(elem_idx, 0);
    }
    getCellDimensions(index) {
        const elem_idx = this.element_indices[index];
        if (elem_idx === -1) {
            return undefined;
        }
        return this.grid.getCellDimensions(elem_idx, 0);
    }
    getCellCoordinates(index) {
        const elem_idx = this.element_indices[index];
        if (elem_idx === -1) {
            return undefined;
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
}
//# sourceMappingURL=DataPlotArray.js.map