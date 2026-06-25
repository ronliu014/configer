import { useMemo, useState } from "react";

import type { TableRow } from "../../../core/table/tableTypes";
import { EquipQualityTag } from "../components/EquipQualityTag";
import {
  createEquipListView,
  type EquipListFilters
} from "../services/equipListService";

interface EquipListPageProps {
  pageSize?: number;
  rows: TableRow[];
}

const defaultFilters: Required<EquipListFilters> = {
  job: "",
  part: "",
  quality: "",
  turn: ""
};

export function EquipListPage({ pageSize = 20, rows }: EquipListPageProps) {
  const [searchText, setSearchText] = useState("");
  const [filters, setFilters] = useState<Required<EquipListFilters>>(defaultFilters);
  const [page, setPage] = useState(1);
  const view = createEquipListView({
    rows,
    query: {
      searchText,
      filters,
      page,
      pageSize
    }
  });
  const filterOptions = useMemo(() => createFilterOptions(rows), [rows]);

  function updateFilter(key: keyof EquipListFilters, value: string): void {
    setFilters((currentFilters) => ({
      ...currentFilters,
      [key]: value
    }));
    setPage(1);
  }

  function resetFilters(): void {
    setSearchText("");
    setFilters(defaultFilters);
    setPage(1);
  }

  return (
    <section className="module-workspace" aria-label="装备配置">
      <div className="page-heading">
        <p className="eyebrow">业务配置</p>
        <h2>装备列表</h2>
      </div>

      <div className="list-toolbar">
        <label className="field-control">
          <span>搜索</span>
          <input
            aria-label="搜索"
            onChange={(event) => {
              setSearchText(event.target.value);
              setPage(1);
            }}
            type="search"
            value={searchText}
          />
        </label>

        <FilterSelect
          label="职业"
          onChange={(value) => updateFilter("job", value)}
          options={filterOptions.job}
          value={filters.job}
        />
        <FilterSelect
          label="品质"
          onChange={(value) => updateFilter("quality", value)}
          options={filterOptions.quality}
          value={filters.quality}
        />
        <FilterSelect
          label="转数"
          onChange={(value) => updateFilter("turn", value)}
          options={filterOptions.turn}
          value={filters.turn}
        />
        <FilterSelect
          label="部位"
          onChange={(value) => updateFilter("part", value)}
          options={filterOptions.part}
          value={filters.part}
        />
        <button className="secondary-button" onClick={resetFilters} type="button">
          重置
        </button>
      </div>

      <div className="table-shell">
        <table aria-label="装备列表" className="data-table">
          <thead>
            <tr>
              <th scope="col">装备 ID</th>
              <th scope="col">备注</th>
              <th scope="col">部位</th>
              <th scope="col">职业</th>
              <th scope="col">转数</th>
              <th scope="col">品质</th>
              <th scope="col">等级</th>
              <th scope="col">状态</th>
            </tr>
          </thead>
          <tbody>
            {view.items.map((item) => (
              <tr key={item.equipId}>
                <td>{item.equipId}</td>
                <td>{item.remark || "-"}</td>
                <td>{item.part || "-"}</td>
                <td>{item.job || "-"}</td>
                <td>{item.turn || "-"}</td>
                <td>
                  <EquipQualityTag quality={item.quality} />
                </td>
                <td>{item.level || "-"}</td>
                <td>{item.status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination-bar">
        <div className="pagination-summary">
          <span>共 {view.total} 条</span>
          <span>
            第 {view.page} / {view.totalPages} 页
          </span>
        </div>
        <div className="pagination-actions">
          <button
            className="secondary-button"
            disabled={view.page <= 1}
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            type="button"
          >
            上一页
          </button>
          <button
            className="secondary-button"
            disabled={view.page >= view.totalPages}
            onClick={() => setPage((currentPage) => currentPage + 1)}
            type="button"
          >
            下一页
          </button>
        </div>
      </div>
    </section>
  );
}

interface FilterSelectProps {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}

function FilterSelect({ label, onChange, options, value }: FilterSelectProps) {
  return (
    <label className="field-control">
      <span>{label}</span>
      <select
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">全部</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function createFilterOptions(rows: TableRow[]): Record<keyof Required<EquipListFilters>, string[]> {
  return {
    job: getUniqueTextValues(rows, "job"),
    part: getUniqueTextValues(rows, "part"),
    quality: getUniqueTextValues(rows, "quality"),
    turn: getUniqueTextValues(rows, "turn")
  };
}

function getUniqueTextValues(rows: TableRow[], key: string): string[] {
  const values = new Set<string>();

  for (const row of rows) {
    const value = row.values[key];
    if (value !== null && value !== undefined && value !== "") {
      values.add(String(value));
    }
  }

  return [...values].sort((left, right) => left.localeCompare(right));
}
