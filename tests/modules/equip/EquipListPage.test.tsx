import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EquipListPage } from "../../../src/modules/equip/pages/EquipListPage";
import type { TableCellValue, TableRow } from "../../../src/core/table/tableTypes";

afterEach(() => {
  cleanup();
});

describe("EquipListPage", () => {
  it("combines search and filters, then resets back to all rows", () => {
    render(
      <EquipListPage
        rows={[
          equipRow("2001001", {
            remark: "战士长剑",
            part: "weapon",
            job: "warrior",
            turn: 1,
            quality: "rare",
            level: 20
          }),
          equipRow("2101001", {
            remark: "法师法杖",
            part: "weapon",
            job: "mage",
            turn: 1,
            quality: "epic",
            level: 20
          })
        ]}
      />
    );

    fireEvent.change(screen.getByLabelText("搜索"), { target: { value: "长剑" } });
    fireEvent.change(screen.getByLabelText("职业"), { target: { value: "warrior" } });
    fireEvent.change(screen.getByLabelText("品质"), { target: { value: "rare" } });

    expect(screen.getByRole("cell", { name: "2001001" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "2101001" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "重置" }));

    expect(screen.getByRole("cell", { name: "2001001" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2101001" })).toBeInTheDocument();
  });

  it("keeps page size stable while paging through results", () => {
    render(
      <EquipListPage
        pageSize={2}
        rows={[
          equipRow("2001001", { remark: "装备 1" }),
          equipRow("2001002", { remark: "装备 2" }),
          equipRow("2001003", { remark: "装备 3" })
        ]}
      />
    );

    expect(screen.getByText("第 1 / 2 页")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2001001" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2001002" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "2001003" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一页" }));

    expect(screen.getByText("第 2 / 2 页")).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "2001001" })).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2001003" })).toBeInTheDocument();
  });
});

function equipRow(primaryKey: string, values: Record<string, TableCellValue>): TableRow {
  return {
    primaryKey,
    sourceRow: Number(primaryKey.slice(-3)),
    sourcePath: "equip/equip.xlsx",
    sheetName: "equip",
    values: {
      equipId: primaryKey,
      status: "normal",
      ...values
    }
  };
}
