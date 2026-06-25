import { readWorkbookTable, WorkbookReadError } from "../core/excel/workbookReader";
import { ParseHeaderError } from "../core/excel/headerProtocol";
import { FileAccessError, validateRootPair, type FileAccessAdapter } from "../core/file/fileAccess";
import type { ConfigModule } from "../core/schema/schemaTypes";
import { createTableStore, type TableStore } from "../core/table/tableStore";
import type { TableData } from "../core/table/tableTypes";

export interface SessionState {
  isLoaded: boolean;
}

export const initialSessionState: SessionState = {
  isLoaded: false
};

export interface LoadConfigSessionInput {
  sourceRoot: string;
  targetRoot: string;
  fileAccess: FileAccessAdapter;
  modules: ConfigModule[];
  primaryKeys?: Record<string, string>;
}

export interface SessionTableRequest {
  tableName: string;
  sourcePath: string;
  sheetName: string;
  readonly: boolean;
}

export interface LoadedSessionTable extends SessionTableRequest {
  rowCount: number;
}

export interface FailedSessionTable extends SessionTableRequest {
  reason: string;
}

export interface ConfigSession {
  sourceRoot: string;
  targetRoot: string;
  canEdit: boolean;
  loadedTables: LoadedSessionTable[];
  missingTables: SessionTableRequest[];
  failedTables: FailedSessionTable[];
  tableStore: TableStore;
}

export class SessionLoadError extends Error {
  readonly reason: string;

  constructor(reason: string) {
    super(reason);
    this.name = "SessionLoadError";
    this.reason = reason;
  }
}

const defaultPrimaryKeys: Record<string, string> = {
  equip: "Id",
  item: "Id",
  language: "Key",
  equip_job_group: "GroupID",
  equip_proplib: "ID",
  equip_random_proplib: "ID",
  equip_special_drop: "DropID",
  equip_suit: "SuitID",
  equip_rare: "RareID",
  equip_skill_drop: "DropID",
  equip_skill_effect: "ID",
  equip_special_prop: "ID"
};

export async function loadConfigSession(input: LoadConfigSessionInput): Promise<ConfigSession> {
  const rootValidation = validateRootPair({
    sourceRoot: input.sourceRoot,
    targetRoot: input.targetRoot
  });
  if (!rootValidation.ok) {
    throw new SessionLoadError(rootValidation.reason);
  }

  const requests = createSessionTableRequests(input.modules);
  const loadedTables: LoadedSessionTable[] = [];
  const missingTables: SessionTableRequest[] = [];
  const failedTables: FailedSessionTable[] = [];
  const tableData: TableData[] = [];

  for (const request of requests) {
    const sourceBytes = await readSessionTableBytes(input.fileAccess, request, missingTables);
    if (!sourceBytes) {
      continue;
    }

    const table = readSessionTable(request, sourceBytes, input.primaryKeys ?? {}, failedTables);
    if (!table) {
      continue;
    }

    tableData.push(table);
    loadedTables.push({
      ...request,
      rowCount: table.rows.length
    });
  }

  return {
    sourceRoot: input.sourceRoot,
    targetRoot: input.targetRoot,
    canEdit: loadedTables.length > 0 && missingTables.length === 0 && failedTables.length === 0,
    loadedTables,
    missingTables,
    failedTables,
    tableStore: createTableStore(tableData)
  };
}

export function createSessionTableRequests(modules: ConfigModule[]): SessionTableRequest[] {
  const requestsByTableName = new Map<string, SessionTableRequest>();

  for (const module of modules) {
    for (const tableName of module.targetTables) {
      appendUniqueRequest(requestsByTableName, {
        tableName,
        sourcePath: `${tableName}/${tableName}.xlsx`,
        sheetName: tableName,
        readonly: false
      });
    }

    for (const dependencyTable of module.dependencyTables) {
      appendUniqueRequest(requestsByTableName, {
        tableName: dependencyTable.tableName,
        sourcePath: dependencyTable.sourcePath,
        sheetName: dependencyTable.sheetName,
        readonly: dependencyTable.readonly
      });
    }
  }

  return [...requestsByTableName.values()];
}

async function readSessionTableBytes(
  fileAccess: FileAccessAdapter,
  request: SessionTableRequest,
  missingTables: SessionTableRequest[]
): Promise<Uint8Array | undefined> {
  try {
    return await fileAccess.readFile(request.sourcePath);
  } catch (error) {
    if (error instanceof FileAccessError && error.reason === "File not found") {
      missingTables.push(request);
      return undefined;
    }

    throw error;
  }
}

function readSessionTable(
  request: SessionTableRequest,
  sourceBytes: Uint8Array,
  primaryKeys: Record<string, string>,
  failedTables: FailedSessionTable[]
): TableData | undefined {
  try {
    return readWorkbookTable({
      sourcePath: request.sourcePath,
      sourceBytes,
      tableName: request.tableName,
      sheetName: request.sheetName,
      primaryKey: primaryKeys[request.tableName] ?? defaultPrimaryKeys[request.tableName] ?? "Id"
    }).table;
  } catch (error) {
    if (error instanceof WorkbookReadError || error instanceof ParseHeaderError) {
      failedTables.push({
        ...request,
        reason: error.reason
      });
      return undefined;
    }

    throw error;
  }
}

function appendUniqueRequest(
  requestsByTableName: Map<string, SessionTableRequest>,
  request: SessionTableRequest
): void {
  if (!requestsByTableName.has(request.tableName)) {
    requestsByTableName.set(request.tableName, request);
  }
}
