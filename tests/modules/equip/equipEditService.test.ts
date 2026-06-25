import { describe, expect, it } from "vitest";

import { createTableStore } from "../../../src/core/table/tableStore";
import {
  addEquipRow,
  confirmDeleteEquipRow,
  createDeleteEquipPlan,
  EquipEditError,
  updateEquipRow
} from "../../../src/modules/equip/services/equipEditService";
import type { TableData, TableRow } from "../../../src/core/table/tableTypes";

describe("equipEditService", () => {
  it("adds a generated equip row when the equip id is unique", () => {
    const store = createStore([]);

    const result = addEquipRow(store, {
      remark: "战士长剑",
      part: 1,
      job: 1,
      turn: 0,
      branch: 1,
      quality: 1,
      level: 1,
      seriesNo: 1,
      icon: "sword_001"
    });

    expect(result.row.primaryKey).toBe(3011011001);
    expect(store.findRow("equip", 3011011001)?.values).toMatchObject({
      equipId: 3011011001,
      remark: "战士长剑",
      itemId: 3011011001,
      nameKey: "EquipName_3011011001",
      descKey: "EquipDes_3011011001",
      icon: "sword_001"
    });
  });

  it("blocks adding an equip row when the generated id already exists", () => {
    const store = createStore([
      equipRow(3011011001, {
        equipId: 3011011001,
        remark: "existing"
      })
    ]);

    expect(() =>
      addEquipRow(store, {
        part: 1,
        job: 1,
        turn: 0,
        branch: 1,
        quality: 1,
        level: 1,
        seriesNo: 1
      })
    ).toThrow(EquipEditError);
  });

  it("updates the original row and allows saving its own generated id", () => {
    const store = createStore([
      equipRow(3011011001, {
        equipId: 3011011001,
        remark: "old",
        part: 1,
        job: 1,
        turn: 0,
        branch: 1,
        quality: 1,
        level: 1,
        seriesNo: 1
      })
    ]);

    updateEquipRow(store, 3011011001, {
      remark: "updated",
      part: 1,
      job: 1,
      turn: 0,
      branch: 1,
      quality: 1,
      level: 1,
      seriesNo: 1
    });

    expect(store.getTable("equip")?.rows).toHaveLength(1);
    expect(store.findRow("equip", 3011011001)?.values.remark).toBe("updated");
  });

  it("blocks editing a row into another row's generated id", () => {
    const store = createStore([
      equipRow(3011011001, {
        equipId: 3011011001,
        part: 1,
        job: 1,
        turn: 0,
        branch: 1,
        quality: 1,
        level: 1,
        seriesNo: 1
      }),
      equipRow(3011011002, {
        equipId: 3011011002,
        part: 1,
        job: 1,
        turn: 0,
        branch: 1,
        quality: 1,
        level: 1,
        seriesNo: 2
      })
    ]);

    expect(() =>
      updateEquipRow(store, 3011011002, {
        part: 1,
        job: 1,
        turn: 0,
        branch: 1,
        quality: 1,
        level: 1,
        seriesNo: 1
      })
    ).toThrow(EquipEditError);
    expect(store.findRow("equip", 3011011002)?.values.seriesNo).toBe(2);
  });

  it("updates the original row when editing to a new non-conflicting generated id", () => {
    const store = createStore([
      equipRow(3011011001, {
        equipId: 3011011001,
        remark: "old",
        part: 1,
        job: 1,
        turn: 0,
        branch: 1,
        quality: 1,
        level: 1,
        seriesNo: 1
      })
    ]);

    updateEquipRow(store, 3011011001, {
      remark: "moved",
      part: 1,
      job: 1,
      turn: 0,
      branch: 1,
      quality: 1,
      level: 1,
      seriesNo: 2
    });

    expect(store.getTable("equip")?.rows).toHaveLength(1);
    expect(store.findRow("equip", 3011011001)).toBeUndefined();
    expect(store.findRow("equip", 3011011002)?.values).toMatchObject({
      equipId: 3011011002,
      remark: "moved",
      seriesNo: 2
    });
  });

  it("does not delete before confirmation and deletes after confirmation", () => {
    const store = createStore([
      equipRow(3011011001, {
        equipId: 3011011001,
        remark: "target"
      })
    ]);

    const plan = createDeleteEquipPlan(store, 3011011001);

    expect(plan).toEqual({
      tableName: "equip",
      primaryKey: 3011011001,
      remark: "target"
    });
    expect(store.findRow("equip", 3011011001)).toBeDefined();
    expect(confirmDeleteEquipRow(store, plan)).toBe(true);
    expect(store.findRow("equip", 3011011001)).toBeUndefined();
  });
});

function createStore(rows: TableRow[]) {
  return createTableStore([createEquipTable(rows)]);
}

function createEquipTable(rows: TableRow[]): TableData {
  return {
    tableName: "equip",
    primaryKey: "equipId",
    rows
  };
}

function equipRow(primaryKey: number, values: Record<string, string | number>): TableRow {
  return {
    primaryKey,
    sourceRow: primaryKey - 3011010996,
    sourcePath: "equip/equip.xlsx",
    sheetName: "equip",
    values
  };
}
