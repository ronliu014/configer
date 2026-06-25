import { cleanup, render, screen } from "@testing-library/react";
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
    render(<App session={{ isLoaded: true }} />);

    const equipButton = screen.getByRole("button", { name: "装备" });
    expect(equipButton).toBeEnabled();
    expect(equipButton).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "item" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "language" })).toBeEnabled();
    expect(screen.getByText("已加载 sourceRoot / targetRoot")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "装备列表" })).toBeInTheDocument();
    expect(screen.queryByText("等待选择配置根目录")).not.toBeInTheDocument();
  });
});
