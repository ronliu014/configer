import type {
  BaselineSnapshot,
  TableCellValue,
  TableData,
  TableIndex,
  TablePrimaryKey,
  TableRow
} from "./tableTypes";

export class TableStoreError extends Error {
  readonly tableName: string;
  readonly primaryKey?: TablePrimaryKey;
  readonly reason: string;

  constructor(options: {
    tableName: string;
    reason: string;
    primaryKey?: TablePrimaryKey;
  }) {
    super(`${options.tableName}: ${options.reason}`);
    this.name = "TableStoreError";
    this.tableName = options.tableName;
    this.primaryKey = options.primaryKey;
    this.reason = options.reason;
  }
}

export interface TableStore {
  getTable(tableName: string): TableData | undefined;
  getBaseline(): BaselineSnapshot;
  findRow(tableName: string, primaryKey: TablePrimaryKey): TableRow | undefined;
  addRow(tableName: string, row: TableRow): void;
  updateRow(
    tableName: string,
    primaryKey: TablePrimaryKey,
    values: Record<string, TableCellValue>
  ): boolean;
  deleteRow(tableName: string, primaryKey: TablePrimaryKey): boolean;
}

export function createTableStore(tables: TableData[]): TableStore {
  const currentTables = new Map<string, TableData>();
  const baseline: BaselineSnapshot = {};
  const indexes = new Map<string, TableIndex>();

  for (const table of tables) {
    const currentTable = cloneTableData(table);
    currentTables.set(table.tableName, currentTable);
    baseline[table.tableName] = cloneTableData(table);
    indexes.set(table.tableName, createTableIndex(currentTable));
  }

  return {
    getTable(tableName) {
      return currentTables.get(tableName);
    },
    getBaseline() {
      return baseline;
    },
    findRow(tableName, primaryKey) {
      return indexes.get(tableName)?.rowsByPrimaryKey.get(primaryKey);
    },
    addRow(tableName, row) {
      const table = currentTables.get(tableName);
      const index = indexes.get(tableName);
      if (!table || !index) {
        throw new TableStoreError({
          tableName,
          reason: "Unknown table",
          primaryKey: row.primaryKey
        });
      }
      if (index.rowsByPrimaryKey.has(row.primaryKey)) {
        throw new TableStoreError({
          tableName,
          reason: "Duplicate primary key",
          primaryKey: row.primaryKey
        });
      }

      const nextRow = cloneTableRow(row);
      table.rows.push(nextRow);
      index.rowsByPrimaryKey.set(nextRow.primaryKey, nextRow);
    },
    updateRow(tableName, primaryKey, values) {
      const row = indexes.get(tableName)?.rowsByPrimaryKey.get(primaryKey);
      if (!row) {
        return false;
      }

      row.values = {
        ...row.values,
        ...values
      };
      return true;
    },
    deleteRow(tableName, primaryKey) {
      const table = currentTables.get(tableName);
      const index = indexes.get(tableName);
      const row = index?.rowsByPrimaryKey.get(primaryKey);
      if (!table || !index || !row) {
        return false;
      }

      table.rows = table.rows.filter((currentRow) => currentRow.primaryKey !== primaryKey);
      index.rowsByPrimaryKey.delete(primaryKey);
      return true;
    }
  };
}

function createTableIndex(table: TableData): TableIndex {
  const rowsByPrimaryKey = new Map<TablePrimaryKey, TableRow>();

  for (const row of table.rows) {
    if (rowsByPrimaryKey.has(row.primaryKey)) {
      throw new TableStoreError({
        tableName: table.tableName,
        reason: "Duplicate primary key",
        primaryKey: row.primaryKey
      });
    }
    rowsByPrimaryKey.set(row.primaryKey, row);
  }

  return {
    tableName: table.tableName,
    primaryKey: table.primaryKey,
    rowsByPrimaryKey
  };
}

function cloneTableData(table: TableData): TableData {
  return {
    ...table,
    rows: table.rows.map(cloneTableRow)
  };
}

function cloneTableRow(row: TableRow): TableRow {
  return {
    ...row,
    values: {
      ...row.values
    }
  };
}
