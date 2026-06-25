import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { readWorkbookTable } from "../../../src/core/excel/workbookReader";
import { createMinimalWorkbookFixture } from "../../fixtures/workbookFixture";

describe("readWorkbookTable", () => {
  it("loads table rows from a worksheet using the 4-row header protocol", () => {
    const fixture = createMinimalWorkbookFixture();

    const result = readWorkbookTable({
      sourcePath: fixture.sourcePath,
      sourceBytes: fixture.sourceBytes,
      tableName: "equip",
      sheetName: "equip",
      primaryKey: "EquipId"
    });

    expect(result.table).toEqual({
      tableName: "equip",
      primaryKey: "EquipId",
      rows: [
        {
          primaryKey: 1001,
          sourceRow: 5,
          sourcePath: "equip/equip.xlsx",
          sheetName: "equip",
          values: {
            EquipId: 1001,
            ManualName: "旧名称",
            GeneratedScore: 10,
            FormulaNote: "old-derived"
          }
        }
      ]
    });
    expect(result.header.columns.map((column) => column.srcName)).toEqual([
      "EquipId",
      "ManualName",
      "GeneratedScore",
      "FormulaNote"
    ]);
  });

  it("reports missing worksheet as a structured workbook read error", () => {
    const fixture = createMinimalWorkbookFixture();

    expect(() =>
      readWorkbookTable({
        sourcePath: fixture.sourcePath,
        sourceBytes: fixture.sourceBytes,
        tableName: "equip",
        sheetName: "missing",
        primaryKey: "EquipId"
      })
    ).toThrowError("equip/equip.xlsx!missing: Sheet not found");
  });

  it("reports rows with missing primary key as a structured workbook read error", () => {
    const fixture = createMinimalWorkbookFixture();

    expect(() =>
      readWorkbookTable({
        sourcePath: fixture.sourcePath,
        sourceBytes: fixture.sourceBytes,
        tableName: "equip",
        sheetName: "equip",
        primaryKey: "MissingId"
      })
    ).toThrowError("equip/equip.xlsx!equip: Primary key column not found: MissingId");
  });

  it("preserves source row numbers when blank worksheet rows exist", () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet([
      ["ID", "Name"],
      ["A", "A"],
      ["int", "string"],
      ["Id", "Name"],
      [1001, "first"],
      [],
      [1002, "second"]
    ]);
    XLSX.utils.book_append_sheet(workbook, sheet, "equip");
    const sourceBytes = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const result = readWorkbookTable({
      sourcePath: "equip/equip.xlsx",
      sourceBytes: new Uint8Array(sourceBytes),
      tableName: "equip",
      sheetName: "equip",
      primaryKey: "Id"
    });

    expect(result.table.rows.map((row) => row.sourceRow)).toEqual([5, 7]);
  });
});
