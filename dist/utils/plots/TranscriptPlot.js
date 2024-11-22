export class TranscriptPlot {
    svg;
    dimensions;
    genome_length;
    transcript;
    exon_svgs;
    cds_svgs;
    intron_svgs;
    constructor(svg, data) {
        this.svg = svg;
        this.dimensions = data.dimensions;
        this.genome_length = data.genome_length;
        this.transcript = data.transcript;
        this.exon_svgs = [];
        this.cds_svgs = [];
        this.intron_svgs = [];
    }
    plot() {
        let e_i = 0;
        const exons = this.transcript.getExons();
        for (const exon of exons) {
            const exon_start = (exon.getStart() / this.genome_length) * this.dimensions["width"];
            const exon_end = (exon.getEnd() / this.genome_length) * this.dimensions["width"];
            const exonSvg = this.svg
                .append('rect')
                .attr('x', exon_start)
                .attr('y', this.dimensions["height"] * ((1 - 0.5) / 2))
                .attr('width', (exon_end - exon_start))
                .attr('height', this.dimensions["height"] * 0.5)
                .style('fill', '#4A88CA');
            this.exon_svgs.push(exonSvg);
            // Draw introns
            if (e_i > 0) {
                const prev_exon_end = (exons[e_i - 1].getEnd() / this.genome_length) * this.dimensions["width"];
                const intronSvg = this.svg.append('line')
                    .attr('x1', prev_exon_end)
                    .attr('y1', this.dimensions["height"] / 2) // Adjust y position as needed
                    .attr('x2', exon_start)
                    .attr('y2', this.dimensions["height"] / 2) // Adjust y position as needed
                    .style('stroke', '#280274') // Adjust line color for gene labels
                    .style('stroke-width', 1);
                this.intron_svgs.push(intronSvg);
            }
            e_i += 1; // increment index            
        }
        // plot CDS
        const CDSs = this.transcript.getCDS();
        for (const cds of CDSs) {
            // scale exon to the dimensions of the plot
            const cds_start = (cds.getStart() / this.genome_length) * this.dimensions["width"];
            const cds_end = (cds.getEnd() / this.genome_length) * this.dimensions["width"];
            const cdsSvg = this.svg
                .append('rect')
                .attr('x', cds_start)
                .attr('y', this.dimensions["height"] * ((1 - 0.75) / 2))
                .attr('width', (cds_end - cds_start))
                .attr('height', this.dimensions["height"] * 0.75)
                .style('fill', '#F2C14E');
            this.cds_svgs.push(cdsSvg);
        }
        ;
    }
}
//# sourceMappingURL=TranscriptPlot.js.map