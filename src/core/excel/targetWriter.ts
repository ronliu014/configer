import * as XLSX from "xlsx";

export interface TargetCellUpdate {
  sheetName: string;
  rowNumber: number;
  columnName: string;
  value: string | number | boolean | null;
}

export interface WriteTargetWorkbookInput {
  sourcePath: string;
  sourceBytes: Uint8Array;
  updates: TargetCellUpdate[];
}

export interface WriteTargetWorkbookResult {
  targetPath: string;
  targetBytes: Uint8Array;
}

export function writeTargetWorkbook(input: WriteTargetWorkbookInput): WriteTargetWorkbookResult {
  const workbook = XLSX.read(input.sourceBytes.slice(), { type: "array", cellFormula: true });

  for (const update of input.updates) {
    const sheet = workbook.Sheets[update.sheetName];
    if (!sheet) {
      throw new Error(`Sheet not found: ${update.sheetName}`);
    }

    const columnIndex = findColumnIndexByHeaderName(sheet, update.columnName);
    const cellAddress = XLSX.utils.encode_cell({
      c: columnIndex,
      r: update.rowNumber - 1
    });

    sheet[cellAddress] = createStaticCell(update.value);
  }

  stripWorkbookFormulas(workbook);

  const targetBytes = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  return {
    targetPath: input.sourcePath,
    targetBytes: new Uint8Array(targetBytes)
  };
}

function findColumnIndexByHeaderName(sheet: XLSX.WorkSheet, columnName: string): number {
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    range: 3
  });
  const headerRow = rows[0] ?? [];
  const columnIndex = headerRow.findIndex((value) => value === columnName);

  if (columnIndex === -1) {
    throw new Error(`Column not found: ${columnName}`);
  }

  return columnIndex;
}

function createStaticCell(value: TargetCellUpdate["value"]): XLSX.CellObject {
  if (value === null) {
    return { t: "z" };
  }

  if (typeof value === "number") {
    return { t: "n", v: value };
  }

  if (typeof value === "boolean") {
    return { t: "b", v: value };
  }

  return { t: "s", v: value };
}

function stripWorkbookFormulas(workbook: XLSX.WorkBook): void {
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    for (const cellAddress of Object.keys(sheet)) {
      if (cellAddress.startsWith("!")) {
        continue;
      }

      const cell = sheet[cellAddress];
      if (cell && "f" in cell) {
        delete cell.f;
      }
    }
  }
}
