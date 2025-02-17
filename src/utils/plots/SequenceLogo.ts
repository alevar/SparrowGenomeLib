import * as d3 from "d3";
import { Dimensions, SJData } from '../../types';

interface SequenceLogoData {
    dimensions: Dimensions;
    sjData: SJData;
    xScale: d3.ScaleLinear<number, number>;
    yScale?: d3.ScaleLinear<number, number>;
    colors?: { [key: string]: string };
}

export class SequenceLogo {
    private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    private dimensions: Dimensions;
    private sjData: SJData;
    private xScale: d3.ScaleLinear<number, number>;
    private yScale: d3.ScaleLinear<number, number>;
    private useProvidedYScale: boolean = false;
    private colors: { [key: string]: string };

    constructor(
        svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
        data: SequenceLogoData
    ) {
        this.svg = svg;
        this.dimensions = data.dimensions;
        this.sjData = data.sjData;
        this.xScale = data.xScale;
        this.colors = data.colors ?? {
            'A': '#32CD32', // Green
            'C': '#1E90FF', // Blue
            'G': '#FFD700', // Gold
            'T': '#DC143C', // Crimson
            'N': '#808080'  // Gray
        };
        // Use provided yScale if available, otherwise initialize a new scale
        this.yScale = data.yScale ?? d3.scaleLinear();
        this.useProvidedYScale = data.yScale !== undefined;
    }

    public get_yScale(): d3.ScaleLinear<number, number> {
        return this.yScale;
    }

    private calculateInformationContent(frequencies: { [key: string]: number }): number {
        const totalFreq = Object.values(frequencies).reduce((a, b) => a + b, 0);
        if (totalFreq === 0) return 0;
        
        const normalizedFreqs = Object.values(frequencies).map(f => f / totalFreq);
        const entropy = normalizedFreqs.reduce((sum, p) => {
            if (p > 0) {
                return sum - (p * Math.log2(p));
            }
            return sum;
        }, 0);
        
        return 2 - entropy; // 2 bits is the maximum information content for DNA
    }

    public plot(): void {
        // Clear any existing content
        this.svg.selectAll("*").remove();

        // Add a background rectangle for the grid
        this.svg.append("rect")
            .attr("class", "grid-background")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", this.dimensions.width)
            .attr("height", this.dimensions.height)
            .attr("fill", "#f7f7f7")
            .attr("fill-opacity", 0.75);

        // If yScale is not provided, set it to [0, 2] for bits of information
        if (!this.useProvidedYScale) {
            this.yScale = d3.scaleLinear()
                .domain([0, 2])
                .range([this.dimensions.height, 0]);
        }

        // Add horizontal grid lines
        this.svg.append("g")
            .attr("class", "grid")
            .attr("stroke", "rgba(0, 0, 0, 0.1)")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0.3)
            .call(d3.axisLeft(this.yScale)
                .ticks(4)
                .tickSize(-this.dimensions.width)
                .tickFormat(null)
            );

        // Process and plot sequence data
        this.sjData.getData().forEach(pos => {
            const x = this.xScale(pos.position);
            let yOffset = this.dimensions.height;

            // Calculate frequencies and information content
            const total = pos.A + pos.C + pos.G + pos.T + pos.N;
            const frequencies = {
                'A': pos.A / total,
                'C': pos.C / total,
                'G': pos.G / total,
                'T': pos.T / total,
                'N': pos.N / total
            };

            const informationContent = this.calculateInformationContent(frequencies);

            // Sort nucleotides by frequency
            const sortedNucs = Object.entries(frequencies)
                .sort(([, a], [, b]) => b - a);

            // Draw letters
            sortedNucs.forEach(([nuc, freq]) => {
                if (freq > 0) {
                    const letterHeight = this.dimensions.height * freq * informationContent;
                    const yPosition = yOffset - letterHeight;

                    // Create letter path
                    this.svg.append('text')
                        .attr('x', x)
                        .attr('y', yPosition)
                        .attr('fill', this.colors[nuc])
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'hanging')
                        .attr('font-family', 'monospace')
                        .attr('font-weight', 'bold')
                        .attr('font-size', `${letterHeight}px`)
                        .text(nuc);

                    yOffset -= letterHeight;
                }
            });
        });
    }
}