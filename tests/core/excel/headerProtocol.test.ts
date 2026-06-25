import { describe, expect, it } from "vitest";

import { parseHeaderRows, ParseHeaderError } from "../../../src/core/excel/headerProtocol";

describe("parseHeaderRows", () => {
  it("parses the four header rows into raw column metadata", () => {
    const result = parseHeaderRows(
      [
        ["装备ID", "备注", "战力评分"],
        ["A", "N", "S"],
        ["int", "string", "int"],
        ["Id", "Remark10", "Score"]
      ],
      { sheetName: "equip" }
    );

    expect(result.sheetName).toBe("equip");
    expect(result.columns).toEqual([
      {
        sheetName: "equip",
        srcCol: 0,
        srcLabel: "装备ID",
        flag: "A",
        type: "int",
        srcName: "Id"
      },
      {
        sheetName: "equip",
        srcCol: 1,
        srcLabel: "备注",
        flag: "N",
        type: "string",
        srcName: "Remark10"
      },
      {
        sheetName: "equip",
        srcCol: 2,
        srcLabel: "战力评分",
        flag: "S",
        type: "int",
        srcName: "Score"
      }
    ]);
  });

  it("throws a structured error when fewer than four header rows are provided", () => {
    expect(() =>
      parseHeaderRows(
        [
          ["装备ID"],
          ["A"],
          ["int"]
        ],
        { sheetName: "equip" }
      )
    ).toThrow(ParseHeaderError);

    try {
      parseHeaderRows(
        [
          ["装备ID"],
          ["A"],
          ["int"]
        ],
        { sheetName: "equip" }
      );
    } catch (error) {
      expect(error).toMatchObject({
        sheetName: "equip",
        row: 4,
        col: 0,
        reason: "Expected 4 header rows, received 3"
      });
    }
  });

  it("throws a structured error when a source field name is missing", () => {
    expect(() =>
      parseHeaderRows(
        [
          ["装备ID", "备注"],
          ["A", "N"],
          ["int", "string"],
          ["Id", ""]
        ],
        { sheetName: "equip" }
      )
    ).toThrow(ParseHeaderError);

    try {
      parseHeaderRows(
        [
          ["装备ID", "备注"],
          ["A", "N"],
          ["int", "string"],
          ["Id", ""]
        ],
        { sheetName: "equip" }
      );
    } catch (error) {
      expect(error).toMatchObject({
        sheetName: "equip",
        row: 4,
        col: 1,
        reason: "Missing source field name"
      });
    }
  });

  it("keeps duplicate srcName columns instead of overwriting source metadata", () => {
    const result = parseHeaderRows(
      [
        ["备注1", "备注2"],
        ["N", "N"],
        ["string", "string"],
        ["Remark10", "Remark10"]
      ],
      { sheetName: "equip" }
    );

    expect(result.columns).toEqual([
      {
        sheetName: "equip",
        srcCol: 0,
        srcLabel: "备注1",
        flag: "N",
        type: "string",
        srcName: "Remark10"
      },
      {
        sheetName: "equip",
        srcCol: 1,
        srcLabel: "备注2",
        flag: "N",
        type: "string",
        srcName: "Remark10"
      }
    ]);
  });
});
