// plots connector triangles from a point to a box
export class TriangleConnector {
    svg;
    dimensions;
    points;
    color = "#000000";
    constructor(data) {
        this.svg = data.svg;
        this.dimensions = data.dimensions;
        this.points = data.points;
        this.color = data.color;
    }
    plot() {
        // draw a triangle from raw_midpoint to spread interval
        this.svg.append("polygon")
            .attr("points", `${this.points.top},${0} ${this.points.left},${this.dimensions.height} ${this.points.right},${this.dimensions.height}`)
            .attr("fill", "none") // No fill for the triangle
            .attr("fill", this.color) // Color of the triangle lines
            .attr("fill-opacity", 0.025) // Opacity of the triangle
            .attr("stroke", this.color) // Color of the triangle lines
            .attr("stroke-opacity", 0.15) // Opacity of the triangle
            .attr("stroke-width", 1); // Width of the triangle lines
        // Plot the line connecting raw_midpoint to spread_midpoint
        this.svg.append("line")
            .attr("x1", this.points.top)
            .attr("y1", 0)
            .attr("x2", this.points.mid)
            .attr("y2", this.dimensions.height)
            .attr("stroke", this.color) // Color of the line
            .attr("stroke-width", 1) // Width of the line
            .attr("stroke-dasharray", "5,5");
    }
}
//# sourceMappingURL=TriangleConnector.js.map