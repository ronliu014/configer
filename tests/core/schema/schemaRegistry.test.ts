import { describe, expect, it } from "vitest";

import { configModules } from "../../../src/app/moduleRegistry";
import { mergeTableSchema } from "../../../src/core/schema/schemaRegistry";
import type { RawColumnMeta, TableSchema } from "../../../src/core/schema/schemaTypes";

describe("mergeTableSchema", () => {
  it("merges raw columns with explicit schema and keeps stable field keys", () => {
    const rawColumns: RawColumnMeta[] = [
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
      }
    ];
    const explicitSchema: TableSchema = {
      tableName: "equip",
      sourcePath: "equip/equip.xlsx",
      sheetName: "equip",
      fields: [
        {
          key: "equipId",
          srcName: "Id",
          source: "manual",
          editable: true,
          control: "number"
        },
        {
          key: "designerNote",
          srcName: "Remark10",
          source: "manual",
          editable: true,
          control: "text"
        }
      ]
    };

    const merged = mergeTableSchema(rawColumns, explicitSchema);

    expect(merged.fields).toEqual([
      {
        key: "equipId",
        srcName: "Id",
        srcCol: 0,
        srcLabel: "装备ID",
        flag: "A",
        type: "int",
        source: "manual",
        editable: true,
        control: "number"
      },
      {
        key: "designerNote",
        srcName: "Remark10",
        srcCol: 1,
        srcLabel: "备注",
        flag: "N",
        type: "string",
        source: "manual",
        editable: true,
        control: "text"
      }
    ]);
  });

  it("throws when explicit schema references a missing source column", () => {
    const explicitSchema: TableSchema = {
      tableName: "equip",
      sourcePath: "equip/equip.xlsx",
      sheetName: "equip",
      fields: [
        {
          key: "equipId",
          srcName: "MissingId",
          source: "manual",
          editable: true,
          control: "number"
        }
      ]
    };

    expect(() => mergeTableSchema([], explicitSchema)).toThrow(
      "Schema field equip.equipId maps missing source column MissingId"
    );
  });

  it("uses the first matching source column when duplicate srcName values exist", () => {
    const rawColumns: RawColumnMeta[] = [
      {
        sheetName: "equip",
        srcCol: 1,
        srcLabel: "备注1",
        flag: "N",
        type: "string",
        srcName: "Remark10"
      },
      {
        sheetName: "equip",
        srcCol: 2,
        srcLabel: "备注2",
        flag: "N",
        type: "string",
        srcName: "Remark10"
      }
    ];
    const explicitSchema: TableSchema = {
      tableName: "equip",
      sourcePath: "equip/equip.xlsx",
      sheetName: "equip",
      fields: [
        {
          key: "designerNote",
          srcName: "Remark10",
          source: "manual",
          editable: true,
          control: "text"
        }
      ]
    };

    const merged = mergeTableSchema(rawColumns, explicitSchema);

    expect(merged.fields[0]).toMatchObject({
      key: "designerNote",
      srcCol: 1,
      srcLabel: "备注1"
    });
  });
});

describe("configModules", () => {
  it("registers equip, item, and language modules", () => {
    expect(configModules.map((module) => module.id)).toEqual(["equip", "item", "language"]);
  });

  it("keeps equip v1 target tables limited to equip, item, and language", () => {
    const equipModule = configModules.find((module) => module.id === "equip");

    expect(equipModule?.targetTables).toEqual(["equip", "item", "language"]);
  });

  it("registers equip relation tables as readonly dependency tables only", () => {
    const equipModule = configModules.find((module) => module.id === "equip");

    expect(equipModule?.dependencyTables).toEqual([
      {
        tableName: "equip_job_group",
        sourcePath: "equip/equip_job_group.xlsx",
        sheetName: "equip_job_group",
        readonly: true
      },
      {
        tableName: "equip_proplib",
        sourcePath: "equip/equip_proplib.xlsx",
        sheetName: "equip_proplib",
        readonly: true
      },
      {
        tableName: "equip_random_proplib",
        sourcePath: "equip/equip_random_proplib.xlsx",
        sheetName: "equip_random_proplib",
        readonly: true
      },
      {
        tableName: "equip_special_drop",
        sourcePath: "equip/equip_special_drop.xlsx",
        sheetName: "equip_special_drop",
        readonly: true
      },
      {
        tableName: "equip_suit",
        sourcePath: "equip/equip_suit.xlsx",
        sheetName: "equip_suit",
        readonly: true
      },
      {
        tableName: "equip_rare",
        sourcePath: "equip/equip_rare.xlsx",
        sheetName: "equip_rare",
        readonly: true
      },
      {
        tableName: "equip_skill_drop",
        sourcePath: "equip/equip_skill_drop.xlsx",
        sheetName: "equip_skill_drop",
        readonly: true
      },
      {
        tableName: "equip_skill_effect",
        sourcePath: "equip/equip_skill_effect.xlsx",
        sheetName: "equip_skill_effect",
        readonly: true
      },
      {
        tableName: "equip_special_prop",
        sourcePath: "equip/equip_special_prop.xlsx",
        sheetName: "equip_special_prop",
        readonly: true
      }
    ]);
    for (const dependency of equipModule?.dependencyTables ?? []) {
      expect(equipModule?.targetTables).not.toContain(dependency.tableName);
    }
  });
});
