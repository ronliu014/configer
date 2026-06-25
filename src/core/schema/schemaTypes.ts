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
