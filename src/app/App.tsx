import { useState } from "react";

import { moduleGroups } from "./moduleRegistry";
import type { AppModule } from "./moduleRegistry";
import { initialSessionState, type SessionState } from "./sessionState";
import { EquipEditPage } from "../modules/equip/pages/EquipEditPage";
import { EquipListPage } from "../modules/equip/pages/EquipListPage";
import { ItemPage } from "../modules/item/pages/ItemPage";
import { LanguagePage } from "../modules/language/pages/LanguagePage";
import {
  addEquipRow,
  confirmDeleteEquipRow,
  createDeleteEquipPlan,
  type EquipEditInput,
  updateEquipRow
} from "../modules/equip/services/equipEditService";
import { createEquipGeneratedFieldsPreview } from "../modules/equip/services/equipEncodeRules";
import { HeaderBar } from "../shared/components/HeaderBar";
import { Sidebar } from "../shared/components/Sidebar";
import { createTableStore } from "../core/table/tableStore";
import type { TableCellValue, TablePrimaryKey, TableRow } from "../core/table/tableTypes";

interface AppProps {
  session?: SessionState;
}

export default function App({ session = initialSessionState }: AppProps) {
  const [activeModuleId, setActiveModuleId] = useState<AppModule["id"]>("equip");
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [equipRows, setEquipRows] = useState<TableRow[]>(session.equipRows ?? []);
  const [itemRows, setItemRows] = useState<TableRow[]>(session.itemRows ?? []);
  const [languageRows, setLanguageRows] = useState<TableRow[]>(session.languageRows ?? []);
  const [editingEquipId, setEditingEquipId] = useState<TableRow["primaryKey"] | undefined>();
  const editingRow = equipRows.find((row) => row.primaryKey === editingEquipId);
  const selectedEquipRow = getSelectedEquipRow(equipRows, editingEquipId);
  const selectedEquipId = selectedEquipRow?.primaryKey ?? "";
  const selectedNameKey = cellToText(selectedEquipRow?.values.nameKey) || `EquipName_${selectedEquipId}`;
  const selectedDescKey = cellToText(selectedEquipRow?.values.descKey) || `EquipDes_${selectedEquipId}`;
  const selectedQuality = cellToText(selectedEquipRow?.values.quality);
  const languageTexts = createLanguageTextMap(languageRows);

  return (
    <main className="app-shell">
      <Sidebar
        activeModuleId={activeModuleId}
        groups={moduleGroups}
        isLoaded={session.isLoaded}
        onSelectModule={(moduleId) => {
          setActiveModuleId(moduleId);
          setView("list");
        }}
      />

      <section className="workspace" aria-label="工作区">
        <HeaderBar isLoaded={session.isLoaded} subtitle="equip v1.0" title="装备配置" />

        {session.isLoaded ? (
          activeModuleId === "item" ? (
            <ItemPage
              equipId={selectedEquipId}
              itemRows={itemRows}
              nameKey={selectedNameKey}
              onRowsChange={setItemRows}
              quality={selectedQuality}
            />
          ) : activeModuleId === "language" ? (
            <LanguagePage
              languageRows={languageRows}
              onRowsChange={setLanguageRows}
              title="装备文案"
              watchedKeys={[selectedNameKey, selectedDescKey]}
            />
          ) : view === "create" ? (
            <EquipEditPage
              languageTexts={languageTexts}
              mode="create"
              onCancel={() => setView("list")}
              onSave={(input) => {
                setEquipRows((currentRows) => {
                  const nextRows = addEquipRowToRows(currentRows, input);
                  setEditingEquipId(nextRows.at(-1)?.primaryKey);
                  return nextRows;
                });
                setView("list");
              }}
            />
          ) : view === "edit" && editingRow ? (
            <EquipEditPage
              languageTexts={languageTexts}
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
                setEquipRows((currentRows) => {
                  const nextRows = updateEquipRowInRows(currentRows, editingRow.primaryKey, input);
                  const nextRow = findRowByGeneratedInput(nextRows, input);
                  setEditingEquipId(nextRow?.primaryKey);
                  return nextRows;
                });
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

function getSelectedEquipRow(
  rows: TableRow[],
  selectedPrimaryKey: TablePrimaryKey | undefined
): TableRow | undefined {
  if (selectedPrimaryKey !== undefined) {
    const selectedRow = rows.find((row) => row.primaryKey === selectedPrimaryKey);
    if (selectedRow) {
      return selectedRow;
    }
  }

  return rows[0];
}

function findRowByGeneratedInput(rows: TableRow[], input: EquipEditInput): TableRow | undefined {
  const generatedFields = createEquipGeneratedFieldsPreview(input);
  return rows.find((row) => String(row.values.equipId ?? row.primaryKey) === String(generatedFields.equipId));
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

function cellToText(value: TableCellValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function createLanguageTextMap(rows: TableRow[]): Record<string, string> {
  return Object.fromEntries(
    rows.map((row) => [String(row.values.key ?? row.primaryKey), cellToText(row.values.zhs)])
  );
}

function UnloadedWorkspace() {
  return (
    <section className="empty-state">
      <h2>等待选择配置根目录</h2>
      <p>sourceRoot 与 targetRoot 选择完成后进入装备配置。</p>
    </section>
  );
}
