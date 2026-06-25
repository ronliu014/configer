import { describe, expect, it } from "vitest";

import { createTableStore } from "../../../src/core/table/tableStore";
import type { TableData, TableRow } from "../../../src/core/table/tableTypes";
import {
  createOrUpdateItemPair,
  findItemPairByEquipId,
  ItemServiceError
} from "../../../src/modules/item/services/itemService";

describe("itemService", () => {
  it("finds unbound and bound item rows by equip id", () => {
    const store = createStore([
      itemRow(3011011001, {
        itemId: 3011011001,
        bindItemId: 83011011001,
        unBindItemId: "",
        nameKey: "EquipName_3011011001",
        quality: 2
      }),
      itemRow(83011011001, {
        itemId: 83011011001,
        bindItemId: "",
        unBindItemId: 3011011001,
        nameKey: "EquipName_3011011001",
        quality: 2
      })
    ]);

    const pair = findItemPairByEquipId(store, 3011011001);

    expect(pair.unbound?.primaryKey).toBe(3011011001);
    expect(pair.bound?.primaryKey).toBe(83011011001);
    expect(pair.status).toBe("ok");
  });

  it("reports a relation error when item pair pointers are not reciprocal", () => {
    const store = createStore([
      itemRow(3011011001, {
        itemId: 3011011001,
        bindItemId: 83011011001,
        unBindItemId: ""
      }),
      itemRow(83011011001, {
        itemId: 83011011001,
        bindItemId: "",
        unBindItemId: 3011011999
      })
    ]);

    expect(findItemPairByEquipId(store, 3011011001)).toMatchObject({
      status: "broken",
      reason: "Bound item points to a different unbound item"
    });
  });

  it("creates missing unbound and bound item rows for an equip id", () => {
    const store = createStore([]);

    const pair = createOrUpdateItemPair(store, {
      equipId: 3011011001,
      quality: 2,
      nameKey: "EquipName_3011011001"
    });

    expect(pair.status).toBe("ok");
    expect(store.findRow("item", 3011011001)?.values).toMatchObject({
      itemId: 3011011001,
      bindItemId: 83011011001,
      unBindItemId: "",
      nameKey: "EquipName_3011011001",
      quality: 2
    });
    expect(store.findRow("item", 83011011001)?.values).toMatchObject({
      itemId: 83011011001,
      bindItemId: "",
      unBindItemId: 3011011001,
      nameKey: "EquipName_3011011001",
      quality: 2
    });
  });

  it("updates existing item pair values without adding duplicate rows", () => {
    const store = createStore([
      itemRow(3011011001, {
        itemId: 3011011001,
        bindItemId: 83011011001,
        unBindItemId: "",
        quality: 1
      }),
      itemRow(83011011001, {
        itemId: 83011011001,
        bindItemId: "",
        unBindItemId: 3011011001,
        quality: 1
      })
    ]);

    createOrUpdateItemPair(store, {
      equipId: 3011011001,
      quality: 3,
      nameKey: "EquipName_3011011001"
    });

    expect(store.getTable("item")?.rows).toHaveLength(2);
    expect(store.findRow("item", 3011011001)?.values.quality).toBe(3);
    expect(store.findRow("item", 83011011001)?.values.quality).toBe(3);
  });

  it("blocks creation when a target item id is already used by unrelated data", () => {
    const store = createStore([
      itemRow(83011011001, {
        itemId: 83011011001,
        bindItemId: "",
        unBindItemId: 3011011999
      })
    ]);

    expect(() =>
      createOrUpdateItemPair(store, {
        equipId: 3011011001,
        quality: 2,
        nameKey: "EquipName_3011011001"
      })
    ).toThrow(ItemServiceError);
  });
});

function createStore(rows: TableRow[]) {
  return createTableStore([createItemTable(rows)]);
}

function createItemTable(rows: TableRow[]): TableData {
  return {
    tableName: "item",
    primaryKey: "itemId",
    rows
  };
}

function itemRow(primaryKey: number, values: Record<string, string | number>): TableRow {
  return {
    primaryKey,
    sourceRow: primaryKey === 3011011001 ? 5 : 6,
    sourcePath: "item/item.xlsx",
    sheetName: "item",
    values
  };
}
