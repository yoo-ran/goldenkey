import type { AgColumn, Column, ColumnGroup, ExcelRow, ExcelStyle, ExcelWorksheetConfigParams, RowNode } from 'ag-grid-community';
import type { GridSerializingParams, RowAccumulator, RowSpanningAccumulator } from 'ag-grid-community';
import { BaseGridSerializingSession, RowType } from 'ag-grid-community';
export interface StyleLinkerInterface {
    rowType: RowType;
    rowIndex: number;
    value: string;
    column?: Column;
    columnGroup?: ColumnGroup;
    node?: RowNode;
}
export interface ExcelGridSerializingParams extends ExcelWorksheetConfigParams, GridSerializingParams {
    baseExcelStyles: ExcelStyle[];
    styleLinker: (params: StyleLinkerInterface) => string[];
    frozenRowCount?: number;
    frozenColumnCount?: number;
}
export declare class ExcelSerializingSession extends BaseGridSerializingSession<ExcelRow[]> {
    private readonly config;
    private readonly stylesByIds;
    private mixedStyles;
    private mixedStyleCounter;
    private readonly excelStyles;
    private rows;
    private cols;
    private columnsToExport;
    private frozenRowCount;
    private skipFrozenRows;
    private frozenColumnCount;
    private skipFrozenColumns;
    constructor(config: ExcelGridSerializingParams);
    addCustomContent(customContent: ExcelRow[]): void;
    onNewHeaderGroupingRow(): RowSpanningAccumulator;
    onNewHeaderRow(): RowAccumulator;
    onNewBodyRow(node?: RowNode): RowAccumulator;
    prepare(columnsToExport: AgColumn[]): void;
    parse(): string;
    private addRowOutlineIfNecessary;
    private isAnyParentCollapsed;
    private convertColumnToExcel;
    private onNewHeaderColumn;
    private onNewBodyColumn;
    private onNewRow;
    private createExcel;
    private getDataTypeForValue;
    private getTypeFromStyle;
    private addImage;
    private createCell;
    private createMergedCell;
    private getCellValue;
    private getStyleId;
    private deepCloneObject;
    private addNewMixedStyle;
    private isFormula;
    private isNumerical;
    private getStyleById;
}
