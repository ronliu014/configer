import type { TableStore } from "../../../core/table/tableStore";
import type { TablePrimaryKey, TableRow } from "../../../core/table/tableTypes";

export interface LanguageTextInput {
  key: string;
  zhs: string;
}

export interface LanguageTextResult {
  key: string;
  status: "configured" | "missing";
  zhs: string;
}

export class LanguageServiceError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(reason);
    this.name = "LanguageServiceError";
    this.reason = reason;
  }
}

export function findLanguageText(store: TableStore, key: TablePrimaryKey): LanguageTextResult {
  const normalizedKey = String(key);
  const row = store.findRow("language", normalizedKey);

  if (!row) {
    return {
      key: normalizedKey,
      status: "missing",
      zhs: ""
    };
  }

  return {
    key: normalizedKey,
    status: "configured",
    zhs: cellToText(row.values.zhs)
  };
}

export function createOrUpdateLanguageText(store: TableStore, input: LanguageTextInput): TableRow {
  const key = input.key.trim();
  if (!key) {
    throw new LanguageServiceError("Language key is required");
  }

  const existingRow = store.findRow("language", key);
  if (existingRow) {
    store.updateRow("language", key, {
      key,
      zhs: input.zhs
    });
    return store.findRow("language", key) ?? existingRow;
  }

  const row: TableRow = {
    primaryKey: key,
    sourceRow: 0,
    sourcePath: "language/language.xlsx",
    sheetName: "language",
    values: {
      key,
      zhs: input.zhs
    }
  };

  store.addRow("language", row);
  return row;
}

function cellToText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
