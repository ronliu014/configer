import type { TableStore } from "../../../core/table/tableStore";
import type { TableCellValue, TablePrimaryKey, TableRow } from "../../../core/table/tableTypes";

export interface ItemPair {
  bound?: TableRow;
  reason?: string;
  status: "ok" | "missing" | "broken";
  unbound?: TableRow;
}

export interface ItemPairInput {
  equipId: TablePrimaryKey;
  nameKey: string;
  quality: number | string;
}

export class ItemServiceError extends Error {
  readonly primaryKey?: TablePrimaryKey;
  readonly reason: string;

  constructor(reason: string, primaryKey?: TablePrimaryKey) {
    super(reason);
    this.name = "ItemServiceError";
    this.primaryKey = primaryKey;
    this.reason = reason;
  }
}

export function createBoundItemId(equipId: TablePrimaryKey): number {
  return Number(`8${String(equipId)}`);
}

export function findItemPairByEquipId(store: TableStore, equipId: TablePrimaryKey): ItemPair {
  const boundItemId = createBoundItemId(equipId);
  const unbound = store.findRow("item", equipId);
  const bound = store.findRow("item", boundItemId);

  if (!unbound && !bound) {
    return {
      status: "missing"
    };
  }

  if (unbound && cellToText(unbound.values.bindItemId) !== String(boundItemId)) {
    return {
      unbound,
      bound,
      status: "broken",
      reason: "Unbound item points to a different bound item"
    };
  }

  if (bound && cellToText(bound.values.unBindItemId) !== String(equipId)) {
    return {
      unbound,
      bound,
      status: "broken",
      reason: "Bound item points to a different unbound item"
    };
  }

  if (!unbound || !bound) {
    return {
      unbound,
      bound,
      status: "broken",
      reason: "Item pair is incomplete"
    };
  }

  return {
    unbound,
    bound,
    status: "ok"
  };
}

export function createOrUpdateItemPair(store: TableStore, input: ItemPairInput): ItemPair {
  const boundItemId = createBoundItemId(input.equipId);
  const pair = findItemPairByEquipId(store, input.equipId);

  if (pair.status === "broken") {
    throw new ItemServiceError(pair.reason ?? "Item pair is broken", input.equipId);
  }

  upsertItemRow(store, input.equipId, {
    itemId: input.equipId,
    bindItemId: boundItemId,
    unBindItemId: "",
    nameKey: input.nameKey,
    quality: input.quality
  });

  upsertItemRow(store, boundItemId, {
    itemId: boundItemId,
    bindItemId: "",
    unBindItemId: input.equipId,
    nameKey: input.nameKey,
    quality: input.quality
  });

  return findItemPairByEquipId(store, input.equipId);
}

function upsertItemRow(
  store: TableStore,
  primaryKey: TablePrimaryKey,
  values: Record<string, TableCellValue>
): void {
  const existingRow = store.findRow("item", primaryKey);
  if (existingRow) {
    store.updateRow("item", primaryKey, values);
    return;
  }

  store.addRow("item", {
    primaryKey,
    sourceRow: 0,
    sourcePath: "item/item.xlsx",
    sheetName: "item",
    values
  });
}

function cellToText(value: TableCellValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
