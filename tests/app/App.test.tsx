import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import App from "../../src/app/App";

describe("App shell", () => {
  it("renders module groups and keeps equip disabled before roots are loaded", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "configer" })).toBeInTheDocument();
    expect(screen.getByText("业务配置")).toBeInTheDocument();
    expect(screen.getByText("公共配置")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "装备" })).toBeDisabled();
    expect(screen.getByText("未加载 sourceRoot / targetRoot")).toBeInTheDocument();
  });
});
