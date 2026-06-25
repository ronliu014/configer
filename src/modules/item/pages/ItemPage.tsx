import { useState } from "react";

import { createTableStore } from "../../../core/table/tableStore";
import type { TablePrimaryKey, TableRow } from "../../../core/table/tableTypes";
import {
  createBoundItemId,
  createOrUpdateItemPair,
  findItemPairByEquipId
} from "../services/itemService";

interface ItemPageProps {
  equipId: TablePrimaryKey;
  itemRows: TableRow[];
  nameKey: string;
  onRowsChange?: (rows: TableRow[]) => void;
  quality: number | string;
}

export function ItemPage({ equipId, itemRows, nameKey, onRowsChange, quality }: ItemPageProps) {
  const [qualityValue, setQualityValue] = useState(String(quality));
  const store = createItemStore(itemRows);
  const pair = findItemPairByEquipId(store, equipId);
  const boundItemId = createBoundItemId(equipId);

  function saveItemPair(): void {
    const nextStore = createItemStore(itemRows);
    createOrUpdateItemPair(nextStore, {
      equipId,
      nameKey,
      quality: qualityValue
    });
    onRowsChange?.(nextStore.getTable("item")?.rows ?? itemRows);
  }

  return (
    <section className="module-workspace" aria-label="item 维护">
      <div className="page-heading">
        <div>
          <p className="eyebrow">公共配置</p>
          <h2>item 维护</h2>
        </div>
      </div>

      <div className="maintenance-grid">
        <div className="preview-panel">
          <h3>配套 item</h3>
          <dl className="preview-list">
            <dt>非绑 ID</dt>
            <dd>{String(equipId)}</dd>
            <dt>绑定 ID</dt>
            <dd>{boundItemId}</dd>
            <dt>Name Key</dt>
            <dd>{nameKey}</dd>
            <dt>状态</dt>
            <dd>{itemStatusLabel(pair.status)}</dd>
          </dl>
          {pair.reason ? <p className="preview-error">{pair.reason}</p> : null}
        </div>

        <label className="field-control">
          <span>道具品质</span>
          <input
            aria-label="道具品质"
            onChange={(event) => setQualityValue(event.target.value)}
            value={qualityValue}
          />
        </label>
      </div>

      <div className="form-actions">
        <button className="primary-button" onClick={saveItemPair} type="button">
          保存 item
        </button>
      </div>
    </section>
  );
}

function createItemStore(rows: TableRow[]) {
  return createTableStore([
    {
      tableName: "item",
      primaryKey: "itemId",
      rows
    }
  ]);
}

function itemStatusLabel(status: "ok" | "missing" | "broken"): string {
  if (status === "ok") {
    return "互指正常";
  }
  if (status === "missing") {
    return "未配置 item";
  }

  return "互指异常";
}
