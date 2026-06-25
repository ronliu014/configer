import { describe, expect, it } from "vitest";

import {
  createEquipListView,
  type EquipListFilters,
  type EquipListQuery
} from "../../../src/modules/equip/services/equipListService";
import type { TableCellValue, TableRow } from "../../../src/core/table/tableTypes";

describe("equipListService", () => {
  it("maps equip rows into list items with display fields", () => {
    const view = createEquipListView({
      rows: [
        equipRow("2001001", {
          remark: "战士一转长剑",
          part: "weapon",
          job: "warrior",
          turn: 1,
          quality: "rare",
          level: 20,
          status: "normal"
        })
      ]
    });

    expect(view.total).toBe(1);
    expect(view.items[0]).toEqual({
      equipId: "2001001",
      remark: "战士一转长剑",
      part: "weapon",
      job: "warrior",
      turn: "1",
      quality: "rare",
      level: "20",
      status: "normal"
    });
  });

  it("combines search and filters for equip list", () => {
    const view = createEquipListView({
      rows: [
        equipRow("2001001", {
          remark: "战士一转长剑",
          part: "weapon",
          job: "warrior",
          turn: 1,
          quality: "rare",
          level: 20
        }),
        equipRow("2001002", {
          remark: "战士二转长剑",
          part: "weapon",
          job: "warrior",
          turn: 2,
          quality: "rare",
          level: 40
        }),
        equipRow("2101001", {
          remark: "法师一转法杖",
          part: "weapon",
          job: "mage",
          turn: 1,
          quality: "epic",
          level: 20
        })
      ],
      query: {
        searchText: "长剑",
        filters: {
          job: "warrior",
          quality: "rare",
          turn: "1",
          part: "weapon"
        }
      }
    });

    expect(view.total).toBe(1);
    expect(view.items.map((item) => item.equipId)).toEqual(["2001001"]);
  });

  it("restores all rows when filters are reset", () => {
    const rows = [
      equipRow("2001001", { remark: "战士长剑", job: "warrior" }),
      equipRow("2101001", { remark: "法师法杖", job: "mage" })
    ];
    const filtered = createEquipListView({
      rows,
      query: { filters: { job: "warrior" } }
    });
    const reset = createEquipListView({
      rows,
      query: { filters: emptyFilters() }
    });

    expect(filtered.total).toBe(1);
    expect(reset.total).toBe(2);
    expect(reset.items.map((item) => item.equipId)).toEqual(["2001001", "2101001"]);
  });

  it("uses stable pagination and clamps out-of-range pages", () => {
    const rows = [
      equipRow("2001001", { remark: "装备 1" }),
      equipRow("2001002", { remark: "装备 2" }),
      equipRow("2001003", { remark: "装备 3" }),
      equipRow("2001004", { remark: "装备 4" }),
      equipRow("2001005", { remark: "装备 5" })
    ];

    const secondPage = createEquipListView({
      rows,
      query: { page: 2, pageSize: 2 }
    });
    const clampedPage = createEquipListView({
      rows,
      query: { page: 99, pageSize: 2 }
    });

    expect(secondPage.items.map((item) => item.equipId)).toEqual(["2001003", "2001004"]);
    expect(secondPage.page).toBe(2);
    expect(secondPage.totalPages).toBe(3);
    expect(clampedPage.page).toBe(3);
    expect(clampedPage.items.map((item) => item.equipId)).toEqual(["2001005"]);
  });
});

function emptyFilters(): EquipListFilters {
  return {
    job: "",
    part: "",
    quality: "",
    turn: ""
  };
}

function equipRow(primaryKey: string, values: Record<string, TableCellValue>): TableRow {
  return {
    primaryKey,
    sourceRow: Number(primaryKey.slice(-3)),
    sourcePath: "equip/equip.xlsx",
    sheetName: "equip",
    values: {
      equipId: primaryKey,
      ...values
    }
  };
}
