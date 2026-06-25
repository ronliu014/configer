import { describe, expect, it } from "vitest";

import { createTableStore } from "../../../src/core/table/tableStore";
import type { TableData, TableRow } from "../../../src/core/table/tableTypes";
import {
  createOrUpdateLanguageText,
  findLanguageText,
  LanguageServiceError
} from "../../../src/modules/language/services/languageService";

describe("languageService", () => {
  it("finds configured Chinese text by language key", () => {
    const store = createStore([
      languageRow("EquipName_3011011001", "战士长剑")
    ]);

    expect(findLanguageText(store, "EquipName_3011011001")).toEqual({
      key: "EquipName_3011011001",
      status: "configured",
      zhs: "战士长剑"
    });
  });

  it("returns missing status with the key when text is not configured", () => {
    const store = createStore([]);

    expect(findLanguageText(store, "EquipName_3011011001")).toEqual({
      key: "EquipName_3011011001",
      status: "missing",
      zhs: ""
    });
  });

  it("creates a missing language row", () => {
    const store = createStore([]);

    createOrUpdateLanguageText(store, {
      key: "EquipName_3011011001",
      zhs: "战士长剑"
    });

    expect(store.findRow("language", "EquipName_3011011001")?.values).toEqual({
      key: "EquipName_3011011001",
      zhs: "战士长剑"
    });
  });

  it("updates an existing language row without adding duplicates", () => {
    const store = createStore([
      languageRow("EquipName_3011011001", "旧名称")
    ]);

    createOrUpdateLanguageText(store, {
      key: "EquipName_3011011001",
      zhs: "新名称"
    });

    expect(store.getTable("language")?.rows).toHaveLength(1);
    expect(store.findRow("language", "EquipName_3011011001")?.values.zhs).toBe("新名称");
  });

  it("rejects an empty key", () => {
    const store = createStore([]);

    expect(() => createOrUpdateLanguageText(store, { key: "", zhs: "空" })).toThrow(LanguageServiceError);
  });
});

function createStore(rows: TableRow[]) {
  return createTableStore([createLanguageTable(rows)]);
}

function createLanguageTable(rows: TableRow[]): TableData {
  return {
    tableName: "language",
    primaryKey: "key",
    rows
  };
}

function languageRow(primaryKey: string, zhs: string): TableRow {
  return {
    primaryKey,
    sourceRow: 5,
    sourcePath: "language/language.xlsx",
    sheetName: "language",
    values: {
      key: primaryKey,
      zhs
    }
  };
}
