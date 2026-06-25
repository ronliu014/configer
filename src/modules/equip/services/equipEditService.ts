import type { TableStore } from "../../../core/table/tableStore";
import type { TableCellValue, TablePrimaryKey, TableRow } from "../../../core/table/tableTypes";
import {
  createEquipGeneratedFieldsPreview,
  type EquipEncodeDimensions
} from "./equipEncodeRules";

export interface EquipEditInput extends EquipEncodeDimensions {
  icon?: string;
  remark?: string;
}

export interface AddEquipRowResult {
  row: TableRow;
}

export interface DeleteEquipPlan {
  primaryKey: TablePrimaryKey;
  remark: string;
  tableName: "equip";
}

export class EquipEditError extends Error {
  readonly primaryKey?: TablePrimaryKey;
  readonly reason: string;

  constructor(reason: string, primaryKey?: TablePrimaryKey) {
    super(reason);
    this.name = "EquipEditError";
    this.primaryKey = primaryKey;
    this.reason = reason;
  }
}

export function addEquipRow(store: TableStore, input: EquipEditInput): AddEquipRowResult {
  const values = createEquipValues(input);
  const equipId = values.equipId as number;

  assertNoEquipConflict(store, equipId);

  const row: TableRow = {
    primaryKey: equipId,
    sourceRow: 0,
    sourcePath: "equip/equip.xlsx",
    sheetName: "equip",
    values
  };

  store.addRow("equip", row);
  return { row };
}

export function updateEquipRow(
  store: TableStore,
  originalEquipId: TablePrimaryKey,
  input: EquipEditInput
): TableRow {
  const currentRow = store.findRow("equip", originalEquipId);
  if (!currentRow) {
    throw new EquipEditError("Equip row not found", originalEquipId);
  }

  const values = createEquipValues(input);
  const nextEquipId = values.equipId as number;
  if (nextEquipId !== originalEquipId) {
    assertNoEquipConflict(store, nextEquipId);
    const nextRow: TableRow = {
      ...currentRow,
      primaryKey: nextEquipId,
      values
    };

    store.deleteRow("equip", originalEquipId);
    store.addRow("equip", nextRow);
    return nextRow;
  }

  store.updateRow("equip", originalEquipId, values);
  const updatedRow = store.findRow("equip", originalEquipId);
  if (!updatedRow) {
    throw new EquipEditError("Equip row not found after update", originalEquipId);
  }

  return updatedRow;
}

export function createDeleteEquipPlan(
  store: TableStore,
  primaryKey: TablePrimaryKey
): DeleteEquipPlan {
  const row = store.findRow("equip", primaryKey);
  if (!row) {
    throw new EquipEditError("Equip row not found", primaryKey);
  }

  return {
    tableName: "equip",
    primaryKey,
    remark: cellToText(row.values.remark)
  };
}

export function confirmDeleteEquipRow(store: TableStore, plan: DeleteEquipPlan): boolean {
  return store.deleteRow(plan.tableName, plan.primaryKey);
}

function createEquipValues(input: EquipEditInput): Record<string, TableCellValue> {
  const generatedFields = createEquipGeneratedFieldsPreview(input);

  return compactCellValues({
    ...input,
    ...generatedFields
  });
}

function assertNoEquipConflict(store: TableStore, equipId: TablePrimaryKey): void {
  if (store.findRow("equip", equipId)) {
    throw new EquipEditError("Duplicate equip id", equipId);
  }
}

function cellToText(value: TableCellValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function compactCellValues(
  values: Record<string, TableCellValue | undefined>
): Record<string, TableCellValue> {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, TableCellValue] => entry[1] !== undefined)
  );
}
