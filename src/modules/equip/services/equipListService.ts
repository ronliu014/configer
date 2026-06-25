import type { TableCellValue, TableRow } from "../../../core/table/tableTypes";

export interface EquipListItem {
  equipId: string;
  remark: string;
  part: string;
  job: string;
  turn: string;
  quality: string;
  level: string;
  status: string;
}

export interface EquipListFilters {
  job?: string;
  part?: string;
  quality?: string;
  turn?: string;
}

export interface EquipListQuery {
  searchText?: string;
  filters?: EquipListFilters;
  page?: number;
  pageSize?: number;
}

export interface EquipListView {
  items: EquipListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface CreateEquipListViewInput {
  rows: TableRow[];
  query?: EquipListQuery;
}

const defaultPage = 1;
const defaultPageSize = 20;

export function createEquipListView(input: CreateEquipListViewInput): EquipListView {
  const pageSize = normalizePositiveInteger(input.query?.pageSize, defaultPageSize);
  const filteredItems = input.rows
    .map(mapEquipListItem)
    .filter((item) => matchesSearch(item, input.query?.searchText))
    .filter((item) => matchesFilters(item, input.query?.filters));
  const total = filteredItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = clampPage(input.query?.page, totalPages);
  const startIndex = (page - 1) * pageSize;

  return {
    items: filteredItems.slice(startIndex, startIndex + pageSize),
    page,
    pageSize,
    total,
    totalPages
  };
}

function mapEquipListItem(row: TableRow): EquipListItem {
  return {
    equipId: cellToText(row.values.equipId ?? row.primaryKey),
    remark: cellToText(row.values.remark),
    part: cellToText(row.values.part),
    job: cellToText(row.values.job),
    turn: cellToText(row.values.turn),
    quality: cellToText(row.values.quality),
    level: cellToText(row.values.level),
    status: cellToText(row.values.status)
  };
}

function matchesSearch(item: EquipListItem, searchText: string | undefined): boolean {
  const normalizedSearch = searchText?.trim().toLocaleLowerCase();
  if (!normalizedSearch) {
    return true;
  }

  return [item.equipId, item.remark].some((value) =>
    value.toLocaleLowerCase().includes(normalizedSearch)
  );
}

function matchesFilters(item: EquipListItem, filters: EquipListFilters | undefined): boolean {
  if (!filters) {
    return true;
  }

  return (
    matchesFilterValue(item.job, filters.job) &&
    matchesFilterValue(item.quality, filters.quality) &&
    matchesFilterValue(item.turn, filters.turn) &&
    matchesFilterValue(item.part, filters.part)
  );
}

function matchesFilterValue(value: string, filterValue: string | undefined): boolean {
  return !filterValue || value === filterValue;
}

function clampPage(page: number | undefined, totalPages: number): number {
  const normalizedPage = normalizePositiveInteger(page, defaultPage);
  return Math.min(normalizedPage, totalPages);
}

function normalizePositiveInteger(value: number | undefined, fallback: number): number {
  if (!value || !Number.isFinite(value) || value < 1) {
    return fallback;
  }

  return Math.floor(value);
}

function cellToText(value: TableCellValue | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}
