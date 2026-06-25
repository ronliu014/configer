import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ItemPage } from "../../../src/modules/item/pages/ItemPage";
import type { TableRow } from "../../../src/core/table/tableTypes";

afterEach(() => {
  cleanup();
});

describe("ItemPage", () => {
  it("shows an existing item pair and saves updated quality", () => {
    let savedRows: TableRow[] = [];

    render(
      <ItemPage
        equipId={3011011001}
        itemRows={[
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
        ]}
        nameKey="EquipName_3011011001"
        onRowsChange={(rows) => {
          savedRows = rows;
        }}
        quality={2}
      />
    );

    expect(screen.getByText("互指正常")).toBeInTheDocument();
    expect(screen.getByText("83011011001")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("道具品质"), { target: { value: "3" } });
    fireEvent.click(screen.getByRole("button", { name: "保存 item" }));

    expect(savedRows).toHaveLength(2);
    expect(savedRows[0].values.quality).toBe("3");
    expect(savedRows[1].values.quality).toBe("3");
  });

  it("creates a missing item pair from equip id", () => {
    let savedRows: TableRow[] = [];

    render(
      <ItemPage
        equipId={3011011001}
        itemRows={[]}
        nameKey="EquipName_3011011001"
        onRowsChange={(rows) => {
          savedRows = rows;
        }}
        quality={2}
      />
    );

    expect(screen.getByText("未配置 item")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "保存 item" }));

    expect(savedRows.map((row) => row.primaryKey)).toEqual([3011011001, 83011011001]);
  });

  it("shows a clear warning for a broken item pair", () => {
    render(
      <ItemPage
        equipId={3011011001}
        itemRows={[
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
        ]}
        nameKey="EquipName_3011011001"
        quality={2}
      />
    );

    expect(screen.getByText("互指异常")).toBeInTheDocument();
    expect(screen.getByText("Bound item points to a different unbound item")).toBeInTheDocument();
  });
});

function itemRow(primaryKey: number, values: Record<string, string | number>): TableRow {
  return {
    primaryKey,
    sourceRow: primaryKey === 3011011001 ? 5 : 6,
    sourcePath: "item/item.xlsx",
    sheetName: "item",
    values
  };
}
