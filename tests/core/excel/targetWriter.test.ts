import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { writeTargetWorkbook } from "../../../src/core/excel/targetWriter";
import { createMinimalWorkbookFixture } from "../../fixtures/workbookFixture";

describe("writeTargetWorkbook", () => {
  it("mirrors the source path and writes manual and generated fields as static target values", () => {
    const fixture = createMinimalWorkbookFixture();
    const originalSourceBytes = new Uint8Array(fixture.sourceBytes);

    const result = writeTargetWorkbook({
      sourcePath: fixture.sourcePath,
      sourceBytes: fixture.sourceBytes,
      updates: [
        { sheetName: "equip", rowNumber: 5, columnName: "ManualName", value: "新名称" },
        { sheetName: "equip", rowNumber: 5, columnName: "GeneratedScore", value: 88 },
        { sheetName: "equip", rowNumber: 5, columnName: "FormulaNote", value: "static-note" }
      ]
    });

    expect(result.targetPath).toBe("equip/equip.xlsx");
    expect(fixture.sourceBytes).toEqual(originalSourceBytes);

    const targetWorkbook = XLSX.read(result.targetBytes, { type: "array", cellFormula: true });
    expect(targetWorkbook.SheetNames).toEqual(["equip", "lookup"]);

    const equipSheet = targetWorkbook.Sheets.equip;
    expect(XLSX.utils.sheet_to_json(equipSheet, { header: 1, range: "A1:D4" })).toEqual([
      ["装备ID", "手填名称", "生成评分", "旧公式列"],
      ["A", "A", "S", "N"],
      ["int", "string", "int", "string"],
      ["EquipId", "ManualName", "GeneratedScore", "FormulaNote"]
    ]);

    expect(equipSheet.B5?.v).toBe("新名称");
    expect(equipSheet.C5?.v).toBe(88);
    expect(equipSheet.D5?.v).toBe("static-note");
    expect(equipSheet.D5?.f).toBeUndefined();

    const lookupSheet = targetWorkbook.Sheets.lookup;
    expect(XLSX.utils.sheet_to_json(lookupSheet, { header: 1 })).toEqual([
      ["关联ID", "关联名称"],
      ["A", "A"],
      ["int", "string"],
      ["RefId", "RefName"],
      [1, "保留行"]
    ]);
  });

  it("does not preserve source formulas when a formula cell is not explicitly updated", () => {
    const fixture = createMinimalWorkbookFixture();

    const result = writeTargetWorkbook({
      sourcePath: fixture.sourcePath,
      sourceBytes: fixture.sourceBytes,
      updates: [
        { sheetName: "equip", rowNumber: 5, columnName: "ManualName", value: "新名称" },
        { sheetName: "equip", rowNumber: 5, columnName: "GeneratedScore", value: 88 }
      ]
    });

    const targetWorkbook = XLSX.read(result.targetBytes, { type: "array", cellFormula: true });
    const formulaCell = targetWorkbook.Sheets.equip.D5;

    expect(formulaCell?.v).toBe("old-derived");
    expect(formulaCell?.f).toBeUndefined();
  });
});
