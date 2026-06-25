import type { LogicalFieldSchema, TableSchema } from "../../../core/schema/schemaTypes";

export const equipSchema: TableSchema = {
  tableName: "equip",
  sourcePath: "equip/equip.xlsx",
  sheetName: "equip",
  fields: [
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
  ]
};

export const equipManualDimensions: LogicalFieldSchema[] = [
  {
    key: "part",
    srcLabel: "部位",
    source: "manual",
    editable: true,
    control: "select",
    required: true,
    target: "static"
  },
  {
    key: "job",
    srcLabel: "职业",
    source: "manual",
    editable: true,
    control: "select",
    required: true,
    target: "static"
  },
  {
    key: "turn",
    srcLabel: "转数",
    source: "manual",
    editable: true,
    control: "select",
    required: true,
    target: "static"
  },
  {
    key: "branch",
    srcLabel: "分支",
    source: "manual",
    editable: true,
    control: "select",
    required: true,
    target: "static"
  },
  {
    key: "quality",
    srcLabel: "品质",
    source: "manual",
    editable: true,
    control: "select",
    required: true,
    target: "static"
  },
  {
    key: "seriesNo",
    srcLabel: "第几套",
    source: "manual",
    editable: true,
    control: "number",
    required: true,
    target: "static"
  },
  {
    key: "level",
    srcLabel: "等级",
    source: "manual",
    editable: true,
    control: "number",
    required: true,
    target: "static"
  },
  {
    key: "icon",
    srcLabel: "图标",
    source: "manual",
    editable: true,
    control: "text",
    required: false,
    target: "static"
  }
];
