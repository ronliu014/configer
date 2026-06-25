import { describe, expect, it } from "vitest";

import { equipRelations } from "../../../src/modules/equip/schema/equipRelations";
import {
  equipManualDimensions,
  equipSchema
} from "../../../src/modules/equip/schema/equipSchema";
import { itemSchema } from "../../../src/modules/item/schema/itemSchema";
import { languageSchema } from "../../../src/modules/language/schema/languageSchema";

describe("equip v1 schemas", () => {
  it("declares known equip source fields with stable keys, source categories, and target output policy", () => {
    expect(equipSchema).toMatchObject({
      tableName: "equip",
      sourcePath: "equip/equip.xlsx",
      sheetName: "equip"
    });

    expect(equipSchema.fields).toEqual([
      {
        key: "equipId",
        srcName: "Id",
        source: "generated",
        editable: false,
        control: "readonly",
        required: true,
        target: "static"
      },
      {
        key: "nameKey",
        srcName: "Name",
        source: "generated",
        editable: false,
        control: "readonly",
        required: true,
        target: "static",
        ref: {
          tableName: "language",
          fieldKey: "key"
        }
      },
      {
        key: "descKey",
        srcName: "Desc",
        source: "generated",
        editable: false,
        control: "readonly",
        required: false,
        target: "static",
        ref: {
          tableName: "language",
          fieldKey: "key"
        }
      },
      {
        key: "itemId",
        srcName: "ItemId",
        source: "generated",
        editable: false,
        control: "readonly",
        required: true,
        target: "static",
        ref: {
          tableName: "item",
          fieldKey: "itemId"
        }
      },
      {
        key: "jobGroupId",
        srcName: "JobGroupID",
        source: "generated",
        editable: false,
        control: "readonly",
        required: true,
        target: "static",
        ref: {
          tableName: "equip_job_group",
          fieldKey: "groupId"
        }
      },
      {
        key: "propLibId",
        srcName: "PropLibID",
        source: "generated",
        editable: false,
        control: "readonly",
        required: true,
        target: "static",
        ref: {
          tableName: "equip_proplib",
          fieldKey: "id"
        }
      },
      {
        key: "randomPropLibId",
        srcName: "RandomPropLibID",
        source: "generated",
        editable: false,
        control: "readonly",
        required: false,
        target: "static",
        ref: {
          tableName: "equip_random_proplib",
          fieldKey: "id"
        }
      },
      {
        key: "suitId",
        srcName: "SuitID",
        source: "generated",
        editable: false,
        control: "readonly",
        required: false,
        target: "static",
        ref: {
          tableName: "equip_suit",
          fieldKey: "suitId"
        }
      }
    ]);
  });

  it("keeps manual equip dimensions as logical fields until real Remark columns are resolved", () => {
    expect(equipManualDimensions.map((field) => field.key)).toEqual([
      "part",
      "job",
      "turn",
      "branch",
      "quality",
      "seriesNo",
      "level",
      "icon"
    ]);
    for (const field of equipManualDimensions) {
      expect(field).toMatchObject({
        source: "manual",
        editable: true,
        target: "static"
      });
      expect(field.srcName).toBeUndefined();
    }
  });

  it("declares equip relation targets and missing severity for v1 checks", () => {
    expect(equipRelations).toEqual([
      {
        sourceTable: "equip",
        sourceField: "itemId",
        targetTable: "item",
        targetField: "Id",
        targetFieldKey: "itemId",
        relationType: "many-to-one",
        missingLevel: "Error",
        readonly: true
      },
      {
        sourceTable: "equip",
        sourceField: "nameKey",
        targetTable: "language",
        targetField: "Key",
        targetFieldKey: "key",
        relationType: "many-to-one",
        missingLevel: "Warning",
        readonly: true
      },
      {
        sourceTable: "equip",
        sourceField: "descKey",
        targetTable: "language",
        targetField: "Key",
        targetFieldKey: "key",
        relationType: "many-to-one",
        missingLevel: "Warning",
        readonly: true
      },
      {
        sourceTable: "equip",
        sourceField: "jobGroupId",
        targetTable: "equip_job_group",
        targetField: "GroupID",
        targetFieldKey: "groupId",
        relationType: "many-to-one",
        missingLevel: "Error",
        readonly: true
      },
      {
        sourceTable: "equip",
        sourceField: "propLibId",
        targetTable: "equip_proplib",
        targetField: "ID",
        targetFieldKey: "id",
        relationType: "many-to-one",
        missingLevel: "Error",
        readonly: true
      },
      {
        sourceTable: "equip",
        sourceField: "randomPropLibId",
        targetTable: "equip_random_proplib",
        targetField: "ID",
        targetFieldKey: "id",
        relationType: "many-to-one",
        missingLevel: "Warning",
        readonly: true
      },
      {
        sourceTable: "equip",
        sourceField: "suitId",
        targetTable: "equip_suit",
        targetField: "SuitID",
        targetFieldKey: "suitId",
        relationType: "many-to-one",
        missingLevel: "Warning",
        readonly: true
      },
      {
        sourceTable: "equip",
        sourceField: "specialDropId",
        targetTable: "equip_special_drop",
        targetField: "DropID",
        targetFieldKey: "dropId",
        relationType: "many-to-one",
        missingLevel: "Warning",
        readonly: true
      },
      {
        sourceTable: "equip",
        sourceField: "skillDropId",
        targetTable: "equip_skill_drop",
        targetField: "DropID",
        targetFieldKey: "dropId",
        relationType: "many-to-one",
        missingLevel: "Warning",
        readonly: true
      }
    ]);
  });

  it("declares item and language writable target schemas", () => {
    expect(itemSchema).toMatchObject({
      tableName: "item",
      sourcePath: "item/item.xlsx",
      sheetName: "item"
    });
    expect(itemSchema.fields.map((field) => [field.key, field.srcName, field.source, field.target]))
      .toEqual([
        ["itemId", "Id", "generated", "static"],
        ["bindItemId", "BindItemId", "generated", "static"],
        ["unBindItemId", "UnBindItemId", "generated", "static"],
        ["nameKey", "Name", "generated", "static"],
        ["quality", "Quality", "generated", "static"]
      ]);
    expect(itemSchema.fields.every((field) => field.editable === false)).toBe(true);

    expect(languageSchema).toMatchObject({
      tableName: "language",
      sourcePath: "language/language.xlsx",
      sheetName: "language"
    });
    expect(languageSchema.fields).toEqual([
      {
        key: "key",
        srcName: "Key",
        source: "manual",
        editable: true,
        control: "text",
        required: true,
        target: "static"
      },
      {
        key: "zhs",
        srcName: "Zhs",
        source: "manual",
        editable: true,
        control: "text",
        required: true,
        target: "static"
      }
    ]);
  });
});
