import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { EquipEditPage } from "../../../src/modules/equip/pages/EquipEditPage";
import type { TableRow } from "../../../src/core/table/tableTypes";

afterEach(() => {
  cleanup();
});

describe("EquipEditPage", () => {
  it("updates generated preview as manual dimensions change", () => {
    render(<EquipEditPage mode="create" />);

    fillBaseDimensions();

    expect(screen.getAllByText("3011011001")).toHaveLength(2);
    expect(screen.getByText("EquipName_3011011001")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("第几套"), { target: { value: "2" } });

    expect(screen.getAllByText("3011011002")).toHaveLength(2);
    expect(screen.getByText("EquipName_3011011002")).toBeInTheDocument();
  });

  it("requires delete confirmation before emitting delete", () => {
    let deleted = false;
    render(
      <EquipEditPage
        mode="edit"
        onDeleteConfirm={() => {
          deleted = true;
        }}
        row={equipRow(3011011001)}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "删除" }));

    expect(deleted).toBe(false);
    expect(screen.getByText("确认删除 3011011001")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "确认删除" }));

    expect(deleted).toBe(true);
  });
});

function fillBaseDimensions(): void {
  fireEvent.change(screen.getByLabelText("部位"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("职业"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("转数"), { target: { value: "0" } });
  fireEvent.change(screen.getByLabelText("分支"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("品质"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("等级"), { target: { value: "1" } });
  fireEvent.change(screen.getByLabelText("第几套"), { target: { value: "1" } });
}

function equipRow(primaryKey: number): TableRow {
  return {
    primaryKey,
    sourceRow: 5,
    sourcePath: "equip/equip.xlsx",
    sheetName: "equip",
    values: {
      equipId: primaryKey,
      remark: "战士长剑",
      part: 1,
      job: 1,
      turn: 0,
      branch: 1,
      quality: 1,
      level: 1,
      seriesNo: 1
    }
  };
}
