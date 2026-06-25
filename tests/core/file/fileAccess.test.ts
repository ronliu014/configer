import { describe, expect, it } from "vitest";

import {
  type BrowserDirectoryHandle,
  type BrowserFileHandle,
  createBrowserFileAccess,
  createMemoryFileAccess,
  resolveTargetPath,
  validateRootPair
} from "../../../src/core/file/fileAccess";

describe("fileAccess", () => {
  it("reads files from an in-memory source root without hard-coded source paths", async () => {
    const files = createMemoryFileAccess({
      "equip/equip.xlsx": new Uint8Array([1, 2, 3])
    });

    await expect(files.readFile("equip/equip.xlsx")).resolves.toEqual(new Uint8Array([1, 2, 3]));
    await expect(files.readFile("source/table/default_ios/equip/equip.xlsx")).rejects.toMatchObject({
      name: "FileAccessError",
      path: "source/table/default_ios/equip/equip.xlsx",
      reason: "File not found"
    });
  });

  it("validates that sourceRoot and targetRoot are distinct and not nested", () => {
    expect(validateRootPair({ sourceRoot: "/configs/source", targetRoot: "/configs/target" }))
      .toEqual({ ok: true });

    expect(validateRootPair({ sourceRoot: "/configs/source", targetRoot: "/configs/source" }))
      .toMatchObject({ ok: false, reason: "sourceRoot and targetRoot must be different" });

    expect(validateRootPair({ sourceRoot: "/configs/source", targetRoot: "/configs/source/out" }))
      .toMatchObject({ ok: false, reason: "targetRoot must not be inside sourceRoot" });

    expect(validateRootPair({ sourceRoot: "/configs/target/source", targetRoot: "/configs/target" }))
      .toMatchObject({ ok: false, reason: "sourceRoot must not be inside targetRoot" });
  });

  it("mirrors source-relative paths to target-relative paths", () => {
    expect(resolveTargetPath("equip/equip.xlsx")).toBe("equip/equip.xlsx");
    expect(resolveTargetPath("item\\item.xlsx")).toBe("item/item.xlsx");
  });

  it("adapts browser directory handles to the file access interface", async () => {
    const files = createBrowserFileAccess(
      createDirectoryHandle({
        equip: createDirectoryHandle({
          "equip.xlsx": createFileHandle(new Uint8Array([7, 8, 9]))
        })
      })
    );

    await expect(files.readFile("equip/equip.xlsx")).resolves.toEqual(new Uint8Array([7, 8, 9]));
    await expect(files.readFile("item/item.xlsx")).rejects.toMatchObject({
      name: "FileAccessError",
      path: "item/item.xlsx",
      reason: "File not found"
    });
  });
});

function createDirectoryHandle(
  entries: Record<string, BrowserDirectoryHandle | BrowserFileHandle>
): BrowserDirectoryHandle {
  return {
    async getDirectoryHandle(name: string) {
      const entry = entries[name];
      if (!entry || !("getDirectoryHandle" in Object(entry))) {
        throw new DOMException("Not found", "NotFoundError");
      }

      return entry as BrowserDirectoryHandle;
    },
    async getFileHandle(name: string) {
      const entry = entries[name];
      if (!entry || !("getFile" in Object(entry))) {
        throw new DOMException("Not found", "NotFoundError");
      }

      return entry as BrowserFileHandle;
    }
  };
}

function createFileHandle(bytes: Uint8Array): BrowserFileHandle {
  return {
    async getFile() {
      return {
        async arrayBuffer() {
          return new Uint8Array(bytes).buffer;
        }
      };
    }
  };
}
