import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LanguagePage } from "../../../src/modules/language/pages/LanguagePage";
import type { TableRow } from "../../../src/core/table/tableTypes";

afterEach(() => {
  cleanup();
});

describe("LanguagePage", () => {
  it("shows configured Chinese text and saves edits", () => {
    let savedRows: TableRow[] = [];

    render(
      <LanguagePage
        languageRows={[languageRow("EquipName_3011011001", "战士长剑")]}
        onRowsChange={(rows) => {
          savedRows = rows;
        }}
        title="装备文案"
        watchedKeys={["EquipName_3011011001"]}
      />
    );

    expect(screen.getByText("已配置")).toBeInTheDocument();
    expect(screen.getByDisplayValue("战士长剑")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("EquipName_3011011001 中文"), {
      target: { value: "战士长剑改" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存 language" }));

    expect(savedRows).toHaveLength(1);
    expect(savedRows[0].values.zhs).toBe("战士长剑改");
  });

  it("shows missing status and key when language text is absent", () => {
    render(
      <LanguagePage
        languageRows={[]}
        title="装备文案"
        watchedKeys={["EquipName_3011011001"]}
      />
    );

    expect(screen.getByText("未配置")).toBeInTheDocument();
    expect(screen.getByText("EquipName_3011011001")).toBeInTheDocument();
  });

  it("creates missing language rows for watched keys", () => {
    let savedRows: TableRow[] = [];

    render(
      <LanguagePage
        languageRows={[]}
        onRowsChange={(rows) => {
          savedRows = rows;
        }}
        title="装备文案"
        watchedKeys={["EquipName_3011011001", "EquipDes_3011011001"]}
      />
    );

    fireEvent.change(screen.getByLabelText("EquipName_3011011001 中文"), {
      target: { value: "战士长剑" }
    });
    fireEvent.change(screen.getByLabelText("EquipDes_3011011001 中文"), {
      target: { value: "最简单的长剑" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存 language" }));

    expect(savedRows.map((row) => row.primaryKey)).toEqual([
      "EquipName_3011011001",
      "EquipDes_3011011001"
    ]);
  });
});

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
