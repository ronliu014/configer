export type FieldSource =
  | "manual"
  | "generated"
  | "formula"
  | "ref"
  | "imported"
  | "hidden"
  | "deprecated";

export interface RawColumnMeta {
  sheetName: string;
  srcCol: number;
  srcLabel: string;
  flag: string;
  type: string;
  srcName: string;
}

export type FieldControl = "text" | "number" | "select" | "readonly";

export interface FieldRef {
  tableName: string;
  fieldKey: string;
}

export type FieldTargetPolicy = "static" | "ignore";

export interface FieldSchema {
  key: string;
  srcName: string;
  srcCol?: number;
  srcLabel?: string;
  flag?: string;
  type?: string;
  source: FieldSource;
  editable: boolean;
  control: FieldControl;
  required?: boolean;
  target?: FieldTargetPolicy;
  ref?: FieldRef;
}

export interface LogicalFieldSchema {
  key: string;
  srcName?: string;
  srcLabel: string;
  source: FieldSource;
  editable: boolean;
  control: FieldControl;
  required: boolean;
  target: FieldTargetPolicy;
}

export type RelationMissingLevel = "Error" | "Warning" | "Info";

export interface TableRelation {
  sourceTable: string;
  sourceField: string;
  targetTable: string;
  targetField: string;
  targetFieldKey: string;
  relationType: "many-to-one";
  missingLevel: RelationMissingLevel;
  readonly: boolean;
}

export interface TableSchema {
  tableName: string;
  sourcePath: string;
  sheetName: string;
  fields: FieldSchema[];
}

export interface DependencyTable {
  tableName: string;
  sourcePath: string;
  sheetName: string;
  readonly: boolean;
}

export interface ConfigModule {
  id: "equip" | "item" | "language";
  label: string;
  targetTables: string[];
  dependencyTables: DependencyTable[];
}
