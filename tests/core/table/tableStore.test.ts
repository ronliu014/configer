import { describe, expect, it } from "vitest";

import { createTableStore, TableStoreError } from "../../../src/core/table/tableStore";
import type { TableData, TableRow } from "../../../src/core/table/tableTypes";

function createEquipTable(rows: TableRow[]): TableData {
  return {
    tableName: "equip",
    primaryKey: "equipId",
    rows
  };
}

function createEquipRow(primaryKey: number, values: Record<string, string | number>): TableRow {
  return {
    primaryKey,
    sourceRow: primaryKey - 996,
    sourcePath: "equip/equip.xlsx",
    sheetName: "equip",
    values
  };
}

describe("createTableStore", () => {
  it("creates a baseline snapshot that is not mutated by current row edits", () => {
    const store = createTableStore([
      createEquipTable([createEquipRow(1001, { equipId: 1001, name: "old" })])
    ]);

    store.updateRow("equip", 1001, { name: "new" });

    expect(store.findRow("equip", 1001)?.values.name).toBe("new");
    expect(store.getBaseline().equip.rows[0].values.name).toBe("old");
  });

  it("returns baseline snapshots that cannot mutate the stored baseline", () => {
    const store = createTableStore([
      createEquipTable([createEquipRow(1001, { equipId: 1001, name: "old" })])
    ]);

    const baseline = store.getBaseline();
    baseline.equip.rows[0].values.name = "mutated";

    expect(store.getBaseline().equip.rows[0].values.name).toBe("old");
  });

  it("finds rows by table name and primary key", () => {
    const row = createEquipRow(1001, { equipId: 1001, name: "sword" });
    const store = createTableStore([createEquipTable([row])]);

    expect(store.findRow("equip", 1001)).toMatchObject(row);
    expect(store.findRow("equip", 9999)).toBeUndefined();
    expect(store.findRow("missing", 1001)).toBeUndefined();
  });

  it("throws a structured error for duplicate primary keys", () => {
    expect(() =>
      createTableStore([
        createEquipTable([
          createEquipRow(1001, { equipId: 1001, name: "old" }),
          createEquipRow(1001, { equipId: 1001, name: "duplicate" })
        ])
      ])
    ).toThrow(TableStoreError);

    try {
      createTableStore([
        createEquipTable([
          createEquipRow(1001, { equipId: 1001, name: "old" }),
          createEquipRow(1001, { equipId: 1001, name: "duplicate" })
        ])
      ]);
    } catch (error) {
      expect(error).toMatchObject({
        name: "TableStoreError",
        tableName: "equip",
        primaryKey: 1001,
        reason: "Duplicate primary key"
      });
    }
  });

  it("adds updates and deletes rows while keeping the primary-key index in sync", () => {
    const store = createTableStore([createEquipTable([])]);

    store.addRow("equip", createEquipRow(1002, { equipId: 1002, name: "created" }));
    expect(store.findRow("equip", 1002)?.values.name).toBe("created");

    store.updateRow("equip", 1002, { name: "updated", level: 30 });
    expect(store.findRow("equip", 1002)?.values).toEqual({
      equipId: 1002,
      name: "updated",
      level: 30
    });

    store.deleteRow("equip", 1002);
    expect(store.findRow("equip", 1002)).toBeUndefined();
    expect(store.getTable("equip")?.rows).toEqual([]);
  });

  it("returns false when deleting a missing row", () => {
    const store = createTableStore([createEquipTable([])]);

    expect(store.deleteRow("equip", 404)).toBe(false);
  });
});
