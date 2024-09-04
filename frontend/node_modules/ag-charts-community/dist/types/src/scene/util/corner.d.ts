import type { ExtendedPath2D } from '../extendedPath2D';
export interface Corner {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    cx: number;
    cy: number;
}
export declare const drawCorner: (path: ExtendedPath2D, { x0, y0, x1, y1, cx, cy }: Corner, cornerRadius: number, move: boolean) => void;
