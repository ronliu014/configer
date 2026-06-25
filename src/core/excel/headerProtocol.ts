import type { RawColumnMeta } from "../schema/schemaTypes";

export interface HeaderProtocolResult {
  sheetName: string;
  columns: RawColumnMeta[];
}

export interface ParseHeaderRowsOptions {
  sheetName: string;
}

export class ParseHeaderError extends Error {
  readonly sheetName: string;
  readonly row: number;
  readonly col: number;
  readonly reason: string;

  constructor(input: { sheetName: string; row: number; col: number; reason: string }) {
    super(`${input.sheetName}!R${input.row}C${input.col + 1}: ${input.reason}`);
    this.name = "ParseHeaderError";
    this.sheetName = input.sheetName;
    this.row = input.row;
    this.col = input.col;
    this.reason = input.reason;
  }
}

export function parseHeaderRows(
  rows: unknown[][],
  options: ParseHeaderRowsOptions
): HeaderProtocolResult {
  if (rows.length < 4) {
    throw new ParseHeaderError({
      sheetName: options.sheetName,
      row: 4,
      col: 0,
      reason: `Expected 4 header rows, received ${rows.length}`
    });
  }

  const [labelRow, flagRow, typeRow, nameRow] = rows;
  const columnCount = Math.max(
    labelRow.length,
    flagRow.length,
    typeRow.length,
    nameRow.length
  );

  const columns = Array.from({ length: columnCount }, (_, srcCol) => {
    const srcName = cellToString(nameRow[srcCol]);
    if (!srcName) {
      throw new ParseHeaderError({
        sheetName: options.sheetName,
        row: 4,
        col: srcCol,
        reason: "Missing source field name"
      });
    }

    return {
      sheetName: options.sheetName,
      srcCol,
      srcLabel: cellToString(labelRow[srcCol]),
      flag: cellToString(flagRow[srcCol]),
      type: cellToString(typeRow[srcCol]),
      srcName
    };
  });

  return {
    sheetName: options.sheetName,
    columns
  };
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
