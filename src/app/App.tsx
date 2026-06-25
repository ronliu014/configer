import { useState } from "react";

import { moduleGroups } from "./moduleRegistry";
import { initialSessionState, type SessionState } from "./sessionState";
import { EquipEditPage } from "../modules/equip/pages/EquipEditPage";
import { EquipListPage } from "../modules/equip/pages/EquipListPage";
import {
  addEquipRow,
  confirmDeleteEquipRow,
  createDeleteEquipPlan,
  type EquipEditInput,
  updateEquipRow
} from "../modules/equip/services/equipEditService";
import { HeaderBar } from "../shared/components/HeaderBar";
import { Sidebar } from "../shared/components/Sidebar";
import { createTableStore } from "../core/table/tableStore";
import type { TableRow } from "../core/table/tableTypes";

interface AppProps {
  session?: SessionState;
}

export default function App({ session = initialSessionState }: AppProps) {
  const activeModuleId = "equip";
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [equipRows, setEquipRows] = useState<TableRow[]>(session.equipRows ?? []);
  const [editingEquipId, setEditingEquipId] = useState<TableRow["primaryKey"] | undefined>();
  const editingRow = equipRows.find((row) => row.primaryKey === editingEquipId);

  return (
    <main className="app-shell">
      <Sidebar activeModuleId={activeModuleId} groups={moduleGroups} isLoaded={session.isLoaded} />

      <section className="workspace" aria-label="工作区">
        <HeaderBar isLoaded={session.isLoaded} subtitle="equip v1.0" title="装备配置" />

        {session.isLoaded ? (
          view === "create" ? (
            <EquipEditPage
              mode="create"
              onCancel={() => setView("list")}
              onSave={(input) => {
                setEquipRows((currentRows) => addEquipRowToRows(currentRows, input));
                setView("list");
              }}
            />
          ) : view === "edit" && editingRow ? (
            <EquipEditPage
              mode="edit"
              onCancel={() => {
                setEditingEquipId(undefined);
                setView("list");
              }}
              onDeleteConfirm={() => {
                setEquipRows((currentRows) => deleteEquipRowFromRows(currentRows, editingRow.primaryKey));
                setEditingEquipId(undefined);
                setView("list");
              }}
              onSave={(input) => {
                setEquipRows((currentRows) => updateEquipRowInRows(currentRows, editingRow.primaryKey, input));
                setEditingEquipId(undefined);
                setView("list");
              }}
              row={editingRow}
            />
          ) : (
            <EquipListPage
              onCreate={() => setView("create")}
              onEdit={(primaryKey) => {
                setEditingEquipId(primaryKey);
                setView("edit");
              }}
              rows={equipRows}
            />
          )
        ) : (
          <UnloadedWorkspace />
        )}
      </section>
    </main>
  );
}

function addEquipRowToRows(rows: TableRow[], input: EquipEditInput): TableRow[] {
  const store = createEquipStore(rows);

  addEquipRow(store, input);
  return store.getTable("equip")?.rows ?? rows;
}

function updateEquipRowInRows(
  rows: TableRow[],
  originalEquipId: TableRow["primaryKey"],
  input: EquipEditInput
): TableRow[] {
  const store = createEquipStore(rows);

  updateEquipRow(store, originalEquipId, input);
  return store.getTable("equip")?.rows ?? rows;
}

function deleteEquipRowFromRows(rows: TableRow[], primaryKey: TableRow["primaryKey"]): TableRow[] {
  const store = createEquipStore(rows);
  const plan = createDeleteEquipPlan(store, primaryKey);

  confirmDeleteEquipRow(store, plan);
  return store.getTable("equip")?.rows ?? rows;
}

function createEquipStore(rows: TableRow[]) {
  return createTableStore([
    {
      tableName: "equip",
      primaryKey: "equipId",
      rows
    }
  ]);
}

function UnloadedWorkspace() {
  return (
    <section className="empty-state">
      <h2>等待选择配置根目录</h2>
      <p>sourceRoot 与 targetRoot 选择完成后进入装备配置。</p>
    </section>
  );
}
