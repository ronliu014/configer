import type { TableSchema } from "../../../core/schema/schemaTypes";

export const languageSchema: TableSchema = {
  tableName: "language",
  sourcePath: "language/language.xlsx",
  sheetName: "language",
  fields: [
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
  ]
};
