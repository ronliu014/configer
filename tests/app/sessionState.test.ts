import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";

import { loadConfigSession } from "../../src/app/sessionState";
import { createMemoryFileAccess } from "../../src/core/file/fileAccess";
import type { ConfigModule } from "../../src/core/schema/schemaTypes";
import { createMinimalWorkbookFixture } from "../fixtures/workbookFixture";

describe("loadConfigSession", () => {
  it("loads module table requests from sourceRoot and creates a table store baseline", async () => {
    const fixture = createMinimalWorkbookFixture();
    const files = createMemoryFileAccess({
      "equip/equip.xlsx": fixture.sourceBytes
    });
    const module: ConfigModule = {
      id: "equip",
      label: "装备",
      targetTables: ["equip"],
      dependencyTables: []
    };

    const session = await loadConfigSession({
      sourceRoot: "/configs/source",
      targetRoot: "/configs/target",
      fileAccess: files,
      modules: [module],
      primaryKeys: {
        equip: "EquipId"
      }
    });

    expect(session.canEdit).toBe(true);
    expect(session.loadedTables).toEqual([
      {
        tableName: "equip",
        sourcePath: "equip/equip.xlsx",
        sheetName: "equip",
        readonly: false,
        rowCount: 1
      }
    ]);
    expect(session.missingTables).toEqual([]);
    expect(session.failedTables).toEqual([]);
    expect(session.tableStore.findRow("equip", 1001)?.values.ManualName).toBe("旧名称");

    session.tableStore.updateRow("equip", 1001, { ManualName: "新名称" });
    expect(session.tableStore.getBaseline().equip.rows[0].values.ManualName).toBe("旧名称");
  });

  it("records missing tables without loading a table store for them", async () => {
    const files = createMemoryFileAccess({});
    const module: ConfigModule = {
      id: "equip",
      label: "装备",
      targetTables: ["equip"],
      dependencyTables: []
    };

    const session = await loadConfigSession({
      sourceRoot: "/configs/source",
      targetRoot: "/configs/target",
      fileAccess: files,
      modules: [module],
      primaryKeys: {
        equip: "EquipId"
      }
    });

    expect(session.canEdit).toBe(false);
    expect(session.loadedTables).toEqual([]);
    expect(session.missingTables).toEqual([
      {
        tableName: "equip",
        sourcePath: "equip/equip.xlsx",
        sheetName: "equip",
        readonly: false
      }
    ]);
  });

  it("records parse failures when a workbook table cannot be loaded", async () => {
    const fixture = createMinimalWorkbookFixture();
    const files = createMemoryFileAccess({
      "equip/equip.xlsx": fixture.sourceBytes
    });
    const module: ConfigModule = {
      id: "equip",
      label: "装备",
      targetTables: ["equip"],
      dependencyTables: []
    };

    const session = await loadConfigSession({
      sourceRoot: "/configs/source",
      targetRoot: "/configs/target",
      fileAccess: files,
      modules: [module],
      primaryKeys: {
        equip: "MissingId"
      }
    });

    expect(session.canEdit).toBe(false);
    expect(session.loadedTables).toEqual([]);
    expect(session.failedTables).toEqual([
      {
        tableName: "equip",
        sourcePath: "equip/equip.xlsx",
        sheetName: "equip",
        readonly: false,
        reason: "Primary key column not found: MissingId"
      }
    ]);
  });

  it("records header protocol failures as failed tables", async () => {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.aoa_to_sheet([
        ["装备ID"],
        ["A"],
        ["int"]
      ]),
      "equip"
    );
    const sourceBytes = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });
    const files = createMemoryFileAccess({
      "equip/equip.xlsx": new Uint8Array(sourceBytes)
    });
    const module: ConfigModule = {
      id: "equip",
      label: "装备",
      targetTables: ["equip"],
      dependencyTables: []
    };

    const session = await loadConfigSession({
      sourceRoot: "/configs/source",
      targetRoot: "/configs/target",
      fileAccess: files,
      modules: [module],
      primaryKeys: {
        equip: "Id"
      }
    });

    expect(session.canEdit).toBe(false);
    expect(session.failedTables).toEqual([
      {
        tableName: "equip",
        sourcePath: "equip/equip.xlsx",
        sheetName: "equip",
        readonly: false,
        reason: "Expected 4 header rows, received 3"
      }
    ]);
  });

  it("rejects sourceRoot and targetRoot that are the same or nested", async () => {
    const files = createMemoryFileAccess({});

    await expect(
      loadConfigSession({
        sourceRoot: "/configs/source",
        targetRoot: "/configs/source/out",
        fileAccess: files,
        modules: [],
        primaryKeys: {}
      })
    ).rejects.toMatchObject({
      name: "SessionLoadError",
      reason: "targetRoot must not be inside sourceRoot"
    });
  });
});
