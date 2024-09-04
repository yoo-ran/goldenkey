import type { OverflowStrategy, TextWrap } from 'ag-charts-types';
import { type MeasureOptions, type TextMeasurer } from './textMeasurer';
export interface WrapOptions extends MeasureOptions {
    maxWidth: number;
    maxHeight?: number;
    lineHeight?: number;
    textWrap?: TextWrap;
    overflow?: OverflowStrategy;
    avoidOrphans?: boolean;
}
export declare class TextWrapper {
    static wrapText(text: string, options: WrapOptions): string;
    static wrapLines(text: string, options: WrapOptions): string[];
    static appendEllipsis(text: string): string;
    static truncateLine(text: string, measurer: TextMeasurer, maxWidth: number, ellipsisForce?: boolean): string;
    private static textWrap;
    private static getWordAt;
    private static clipLines;
    private static avoidOrphans;
}
