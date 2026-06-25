import * as XLSX from "xlsx";

export interface MinimalWorkbookFixture {
  sourcePath: string;
  sourceBytes: Uint8Array;
}

export function createMinimalWorkbookFixture(): MinimalWorkbookFixture {
  const workbook = XLSX.utils.book_new();

  const equipRows = [
    ["装备ID", "手填名称", "生成评分", "旧公式列"],
    ["A", "A", "S", "N"],
    ["int", "string", "int", "string"],
    ["EquipId", "ManualName", "GeneratedScore", "FormulaNote"],
    [1001, "旧名称", 10, { t: "s", v: "old-derived", f: 'CONCAT("old-",A5)' }]
  ];

  const equipSheet = XLSX.utils.aoa_to_sheet(equipRows);
  const lookupSheet = XLSX.utils.aoa_to_sheet([
    ["关联ID", "关联名称"],
    ["A", "A"],
    ["int", "string"],
    ["RefId", "RefName"],
    [1, "保留行"]
  ]);

  XLSX.utils.book_append_sheet(workbook, equipSheet, "equip");
  XLSX.utils.book_append_sheet(workbook, lookupSheet, "lookup");

  const sourceBytes = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array"
  });

  return {
    sourcePath: "equip/equip.xlsx",
    sourceBytes: new Uint8Array(sourceBytes)
  };
}
