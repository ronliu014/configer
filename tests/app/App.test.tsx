import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import App from "../../src/app/App";

afterEach(() => {
  cleanup();
});

describe("App shell", () => {
  it("renders unloaded navigation without showing an empty business list", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "configer" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "配置模块" })).toBeInTheDocument();
    expect(screen.getByText("业务配置")).toBeInTheDocument();
    expect(screen.getByText("公共配置")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "装备" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "item" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "language" })).toBeDisabled();
    expect(screen.getByText("未加载 sourceRoot / targetRoot")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "装备列表" })).not.toBeInTheDocument();
  });

  it("enters the equip list when roots are loaded", () => {
    render(
      <App
        session={{
          isLoaded: true,
          equipRows: [
            {
              primaryKey: "2001001",
              sourceRow: 5,
              sourcePath: "equip/equip.xlsx",
              sheetName: "equip",
              values: {
                equipId: "2001001",
                remark: "战士长剑",
                part: "weapon",
                job: "warrior",
                turn: 1,
                quality: "rare",
                level: 20,
                status: "normal"
              }
            }
          ]
        }}
      />
    );

    const equipButton = screen.getByRole("button", { name: "装备" });
    expect(equipButton).toBeEnabled();
    expect(equipButton).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "item" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "language" })).toBeEnabled();
    expect(screen.getByText("已加载 sourceRoot / targetRoot")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "装备列表" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "装备列表" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "2001001" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "战士长剑" })).toBeInTheDocument();
    expect(screen.queryByText("等待选择配置根目录")).not.toBeInTheDocument();
  });

  it("adds an equip row from the loaded equip list", () => {
    render(<App session={{ isLoaded: true, equipRows: [] }} />);

    fireEvent.click(screen.getByRole("button", { name: "新增" }));

    expect(screen.getByRole("heading", { name: "新增装备" })).toBeInTheDocument();

    fillBaseDimensions();
    fireEvent.change(screen.getByLabelText("备注"), { target: { value: "战士长剑" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByRole("heading", { name: "装备列表" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "3011011001" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "战士长剑" })).toBeInTheDocument();
  });

  it("edits an equip row from the list without adding a duplicate", () => {
    render(<App session={{ isLoaded: true, equipRows: [equipRow(3011011001, "旧备注")] }} />);

    fireEvent.click(screen.getByRole("button", { name: "编辑 3011011001" }));
    fireEvent.change(screen.getByLabelText("备注"), { target: { value: "新备注" } });
    fireEvent.click(screen.getByRole("button", { name: "保存" }));

    expect(screen.getByRole("heading", { name: "装备列表" })).toBeInTheDocument();
    expect(screen.getAllByRole("cell", { name: "3011011001" })).toHaveLength(1);
    expect(screen.queryByRole("cell", { name: "旧备注" })).not.toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "新备注" })).toBeInTheDocument();
  });

  it("does not remove an equip row until delete is confirmed", () => {
    render(<App session={{ isLoaded: true, equipRows: [equipRow(3011011001, "待删除")] }} />);

    fireEvent.click(screen.getByRole("button", { name: "编辑 3011011001" }));
    fireEvent.click(screen.getByRole("button", { name: "删除" }));
    fireEvent.click(screen.getByRole("button", { name: "取消" }));

    expect(screen.getByRole("cell", { name: "3011011001" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "待删除" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "编辑 3011011001" }));
    fireEvent.click(screen.getByRole("button", { name: "删除" }));
    fireEvent.click(screen.getByRole("button", { name: "确认删除" }));

    expect(screen.getByRole("heading", { name: "装备列表" })).toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "3011011001" })).not.toBeInTheDocument();
    expect(screen.queryByRole("cell", { name: "待删除" })).not.toBeInTheDocument();
  });

  it("opens item maintenance for the selected equip row and saves item pair", () => {
    render(<App session={{ isLoaded: true, equipRows: [equipRow(3011011001, "战士长剑")] }} />);

    fireEvent.click(screen.getByRole("button", { name: "编辑 3011011001" }));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    fireEvent.click(screen.getByRole("button", { name: "item" }));

    expect(screen.getByRole("heading", { name: "item 维护" })).toBeInTheDocument();
    expect(screen.getByText("未配置 item")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "保存 item" }));

    expect(screen.getByText("互指正常")).toBeInTheDocument();
    expect(screen.getByText("83011011001")).toBeInTheDocument();
  });

  it("opens language maintenance for the selected equip row and saves Chinese text", () => {
    render(<App session={{ isLoaded: true, equipRows: [equipRow(3011011001, "战士长剑")] }} />);

    fireEvent.click(screen.getByRole("button", { name: "编辑 3011011001" }));
    fireEvent.click(screen.getByRole("button", { name: "保存" }));
    fireEvent.click(screen.getByRole("button", { name: "language" }));

    expect(screen.getByRole("heading", { name: "装备文案" })).toBeInTheDocument();
    expect(screen.getAllByText("未配置")).toHaveLength(2);

    fireEvent.change(screen.getByLabelText("EquipName_3011011001 中文"), {
      target: { value: "战士长剑" }
    });
    fireEvent.click(screen.getByRole("button", { name: "保存 language" }));

    expect(screen.getByDisplayValue("战士长剑")).toBeInTheDocument();
    expect(screen.getByText("已配置")).toBeInTheDocument();
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

function equipRow(primaryKey: number, remark: string) {
  return {
    primaryKey,
    sourceRow: 5,
    sourcePath: "equip/equip.xlsx",
    sheetName: "equip",
    values: {
      equipId: primaryKey,
      remark,
      part: 1,
      job: 1,
      turn: 0,
      branch: 1,
      quality: 1,
      level: 1,
      seriesNo: 1,
      status: "normal"
    }
  };
}
