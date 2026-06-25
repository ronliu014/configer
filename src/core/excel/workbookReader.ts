import * as XLSX from "xlsx";

import { parseHeaderRows, type HeaderProtocolResult } from "./headerProtocol";
import type { TableCellValue, TableData, TablePrimaryKey } from "../table/tableTypes";

export interface ReadWorkbookTableInput {
  sourcePath: string;
  sourceBytes: Uint8Array;
  tableName: string;
  sheetName: string;
  primaryKey: string;
}

export interface ReadWorkbookTableResult {
  table: TableData;
  header: HeaderProtocolResult;
}

export class WorkbookReadError extends Error {
  readonly sourcePath: string;
  readonly sheetName: string;
  readonly reason: string;

  constructor(input: { sourcePath: string; sheetName: string; reason: string }) {
    super(`${input.sourcePath}!${input.sheetName}: ${input.reason}`);
    this.name = "WorkbookReadError";
    this.sourcePath = input.sourcePath;
    this.sheetName = input.sheetName;
    this.reason = input.reason;
  }
}

export function readWorkbookTable(input: ReadWorkbookTableInput): ReadWorkbookTableResult {
  const workbook = XLSX.read(input.sourceBytes.slice(), {
    type: "array",
    cellFormula: true
  });
  const sheet = workbook.Sheets[input.sheetName];
  if (!sheet) {
    throw new WorkbookReadError({
      sourcePath: input.sourcePath,
      sheetName: input.sheetName,
      reason: "Sheet not found"
    });
  }

  const rows = sheetToRows(sheet);
  const header = parseHeaderRows(rows.slice(0, 4).map((row) => row.values), {
    sheetName: input.sheetName
  });
  const primaryKeyColumn = header.columns.find((column) => column.srcName === input.primaryKey);

  if (!primaryKeyColumn) {
    throw new WorkbookReadError({
      sourcePath: input.sourcePath,
      sheetName: input.sheetName,
      reason: `Primary key column not found: ${input.primaryKey}`
    });
  }

  return {
    table: {
      tableName: input.tableName,
      primaryKey: input.primaryKey,
      rows: rows
        .slice(4)
        .filter((row) => !isEmptyRow(row.values))
        .map((row) =>
          createTableRow({
            row: row.values,
            sourceRow: row.sourceRow,
            sourcePath: input.sourcePath,
            sheetName: input.sheetName,
            header,
            primaryKeyColumn: primaryKeyColumn.srcCol
          })
        )
    },
    header
  };
}

interface SheetRow {
  sourceRow: number;
  values: unknown[];
}

function createTableRow(input: {
  row: unknown[];
  sourceRow: number;
  sourcePath: string;
  sheetName: string;
  header: HeaderProtocolResult;
  primaryKeyColumn: number;
}) {
  const values = Object.fromEntries(
    input.header.columns.map((column) => [
      column.srcName,
      toTableCellValue(input.row[column.srcCol])
    ])
  );
  const primaryKey = toTablePrimaryKey(input.row[input.primaryKeyColumn]);

  if (primaryKey === null) {
    throw new WorkbookReadError({
      sourcePath: input.sourcePath,
      sheetName: input.sheetName,
      reason: `Missing primary key at row ${input.sourceRow}`
    });
  }

  return {
    primaryKey,
    sourceRow: input.sourceRow,
    sourcePath: input.sourcePath,
    sheetName: input.sheetName,
    values
  };
}

function sheetToRows(sheet: XLSX.WorkSheet): SheetRow[] {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1:A1");
  const rows: SheetRow[] = [];

  for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
    const values: unknown[] = [];
    for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
      const cellAddress = XLSX.utils.encode_cell({
        r: rowIndex,
        c: columnIndex
      });
      values.push(sheet[cellAddress]?.v ?? null);
    }

    rows.push({
      sourceRow: rowIndex + 1,
      values
    });
  }

  return rows;
}

function isEmptyRow(row: unknown[]): boolean {
  return row.every((value) => value === null || value === undefined || value === "");
}

function toTableCellValue(value: unknown): TableCellValue {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  return String(value);
}

function toTablePrimaryKey(value: unknown): TablePrimaryKey | null {
  const cellValue = toTableCellValue(value);
  if (cellValue === null || cellValue === "") {
    return null;
  }

  if (typeof cellValue === "boolean") {
    return String(cellValue);
  }

  return cellValue;
}
