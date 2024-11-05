import { Dimensions } from '../../types';
interface TriangleConnectorData {
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    dimensions: Dimensions;
    points: {
        "top": number;
        "left": number;
        "right": number;
        "mid": number;
    };
    color: string;
}
export declare class TriangleConnector {
    private svg;
    private dimensions;
    private points;
    private color;
    constructor(data: TriangleConnectorData);
    plot(): void;
}
export {};
