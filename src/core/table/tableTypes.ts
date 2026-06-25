export type TablePrimaryKey = string | number;

export type TableCellValue = string | number | boolean | null;

export interface TableRow {
  primaryKey: TablePrimaryKey;
  sourceRow: number;
  sourcePath: string;
  sheetName: string;
  values: Record<string, TableCellValue>;
}

export interface TableData {
  tableName: string;
  primaryKey: string;
  rows: TableRow[];
}

export interface TableIndex {
  tableName: string;
  primaryKey: string;
  rowsByPrimaryKey: Map<TablePrimaryKey, TableRow>;
}

export type BaselineSnapshot = Record<string, TableData>;
