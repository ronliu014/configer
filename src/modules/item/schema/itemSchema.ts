import type { TableSchema } from "../../../core/schema/schemaTypes";

export const itemSchema: TableSchema = {
  tableName: "item",
  sourcePath: "item/item.xlsx",
  sheetName: "item",
  fields: [
    {
      key: "itemId",
      srcName: "Id",
      source: "generated",
      editable: false,
      control: "readonly",
      required: true,
      target: "static"
    },
    {
      key: "bindItemId",
      srcName: "BindItemId",
      source: "generated",
      editable: false,
      control: "readonly",
      required: true,
      target: "static"
    },
    {
      key: "unBindItemId",
      srcName: "UnBindItemId",
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
      key: "quality",
      srcName: "Quality",
      source: "generated",
      editable: false,
      control: "readonly",
      required: true,
      target: "static"
    }
  ]
};
