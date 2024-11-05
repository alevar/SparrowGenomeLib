import * as d3 from 'd3';
import { Dimensions } from '../../types';
interface DataPlotArrayData {
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
    dimensions: Dimensions;
    elements: number[];
    elementWidth: number;
    coordinateLength: number;
    maxValue: number;
}
export declare class DataPlotArray {
    private svg;
    private dimensions;
    private elements;
    private elementWidth;
    private coordinateLength;
    private maxValue;
    private yScale;
    private raw_xs;
    private spread_elements;
    private element_indices;
    private gridConfig;
    private grid;
    constructor(data: DataPlotArrayData);
    private build_xs;
    private build_grid;
    plot(): void;
    getElementSVG(index: number): d3.Selection<SVGSVGElement, unknown, null, undefined> | undefined;
    getCellDimensions(index: number): {
        width: number;
        height: number;
    } | undefined;
    getCellCoordinates(index: number): {
        x: number;
        y: number;
    } | undefined;
    getYScale(): d3.ScaleLinear<number, number>;
    getElementMapping(index: number): [[number, number], [number, number]];
}
export {};
