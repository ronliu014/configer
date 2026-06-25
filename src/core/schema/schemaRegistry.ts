import type { FieldSchema, RawColumnMeta, TableSchema } from "./schemaTypes";

export function mergeTableSchema(
  rawColumns: RawColumnMeta[],
  explicitSchema: TableSchema
): TableSchema {
  const columnsBySrcName = new Map<string, RawColumnMeta>();

  for (const column of rawColumns) {
    if (!columnsBySrcName.has(column.srcName)) {
      columnsBySrcName.set(column.srcName, column);
    }
  }

  return {
    ...explicitSchema,
    fields: explicitSchema.fields.map((field) =>
      mergeFieldSchema(explicitSchema.tableName, field, columnsBySrcName)
    )
  };
}

function mergeFieldSchema(
  tableName: string,
  field: FieldSchema,
  columnsBySrcName: Map<string, RawColumnMeta>
): FieldSchema {
  const rawColumn = columnsBySrcName.get(field.srcName);
  if (!rawColumn) {
    throw new Error(
      `Schema field ${tableName}.${field.key} maps missing source column ${field.srcName}`
    );
  }

  return {
    ...field,
    srcCol: rawColumn.srcCol,
    srcLabel: rawColumn.srcLabel,
    flag: rawColumn.flag,
    type: rawColumn.type
  };
}
