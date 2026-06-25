import { useState } from "react";

import { createTableStore } from "../../../core/table/tableStore";
import type { TableRow } from "../../../core/table/tableTypes";
import {
  createOrUpdateLanguageText,
  findLanguageText
} from "../services/languageService";

interface LanguagePageProps {
  languageRows: TableRow[];
  onRowsChange?: (rows: TableRow[]) => void;
  title: string;
  watchedKeys: string[];
}

export function LanguagePage({ languageRows, onRowsChange, title, watchedKeys }: LanguagePageProps) {
  const initialTexts = createInitialTexts(languageRows, watchedKeys);
  const [texts, setTexts] = useState<Record<string, string>>(initialTexts);
  const store = createLanguageStore(languageRows);
  const statuses = watchedKeys.map((key) => findLanguageText(store, key));

  function saveLanguageRows(): void {
    const nextStore = createLanguageStore(languageRows);

    for (const key of watchedKeys) {
      const existingText = findLanguageText(nextStore, key);
      const zhs = texts[key] ?? "";
      if (!zhs.trim() && existingText.status === "missing") {
        continue;
      }

      createOrUpdateLanguageText(nextStore, {
        key,
        zhs
      });
    }

    onRowsChange?.(nextStore.getTable("language")?.rows ?? languageRows);
  }

  return (
    <section className="module-workspace" aria-label="language 维护">
      <div className="page-heading">
        <div>
          <p className="eyebrow">公共配置</p>
          <h2>{title}</h2>
        </div>
      </div>

      <div className="language-list">
        {statuses.map((status) => (
          <div className="language-row" key={status.key}>
            <div>
              <span className="language-status">
                {status.status === "configured" ? "已配置" : "未配置"}
              </span>
              <strong>{status.key}</strong>
            </div>
            <label className="field-control">
              <span>中文</span>
              <input
                aria-label={`${status.key} 中文`}
                onChange={(event) =>
                  setTexts((currentTexts) => ({
                    ...currentTexts,
                    [status.key]: event.target.value
                  }))
                }
                value={texts[status.key] ?? ""}
              />
            </label>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button className="primary-button" onClick={saveLanguageRows} type="button">
          保存 language
        </button>
      </div>
    </section>
  );
}

function createInitialTexts(rows: TableRow[], keys: string[]): Record<string, string> {
  const store = createLanguageStore(rows);

  return Object.fromEntries(
    keys.map((key) => {
      const languageText = findLanguageText(store, key);
      return [key, languageText.zhs];
    })
  );
}

function createLanguageStore(rows: TableRow[]) {
  return createTableStore([
    {
      tableName: "language",
      primaryKey: "key",
      rows
    }
  ]);
}
