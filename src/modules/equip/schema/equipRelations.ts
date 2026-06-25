import type { TableRelation } from "../../../core/schema/schemaTypes";

export const equipRelations: TableRelation[] = [
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
];
