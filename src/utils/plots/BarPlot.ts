import * as d3 from "d3";
import { Dimensions, BedData } from '../../types';

interface BarPlotData {
    dimensions: Dimensions;
    xScale: d3.ScaleLinear<number, number>;
    bedData: BedData;
    color: string;
    yScale?: d3.ScaleLinear<number, number>; // Optional yScale parameter
    barWidth?: number; // New optional parameter for bar width
}

export class BarPlot {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private dimensions: Dimensions;
    private bedData: BedData;
    private xScale: d3.ScaleLinear<number, number>;
    private yScale: d3.ScaleLinear<number, number>;
    private useProvidedYScale: boolean = false;
    private color: string;
    private barWidth: number; // New property to store bar width

    constructor(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        data: BarPlotData
    ) {
        this.svg = svg;
        this.dimensions = data.dimensions;
        this.bedData = data.bedData;
        this.xScale = data.xScale;
        this.color = data.color;
        this.yScale = data.yScale ?? d3.scaleLinear();
        this.useProvidedYScale = data.yScale !== undefined;
        
        // Set bar width, with a default of 5 if not provided
        this.barWidth = data.barWidth ?? 5;
    }

    public get_yScale(): d3.ScaleLinear<number, number> {
        return this.yScale;
    }

    public plot(): void {
        // Create the y-axis scale
        if (!this.useProvidedYScale) {
            this.yScale = d3.scaleLinear()
                .domain([0, this.bedData.maxScore()])
                .range([this.dimensions.height, 0]); // Invert the range
        }

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
                .ticks(2)
                .tickSize(-this.dimensions.width)
                .tickFormat(null));

        this.svg.selectAll(".bar")
            .data(this.bedData.getData())
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => {
                // Calculate bar position, adjusting for custom bar width
                const barStart = this.xScale(d.start);
                const totalWidth = this.xScale(d.end) - this.xScale(d.start);
                return barStart + (totalWidth - this.barWidth) / 2;
            })
            .attr("y", d => this.yScale(d.score)) // Position the top of the bar based on score
            .attr("width", this.barWidth) // Use the specified or default bar width
            .attr("height", d => this.dimensions.height - this.yScale(d.score)) // Height based on score
            .attr("fill", this.color);
    }
}