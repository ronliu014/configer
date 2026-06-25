export interface FileAccessAdapter {
  readFile(path: string): Promise<Uint8Array>;
}

export interface BrowserDirectoryHandle {
  getDirectoryHandle(name: string): Promise<BrowserDirectoryHandle>;
  getFileHandle(name: string): Promise<BrowserFileHandle>;
}

export interface BrowserFileHandle {
  getFile(): Promise<BrowserFile>;
}

export interface BrowserFile {
  arrayBuffer(): Promise<ArrayBuffer>;
}

export interface ValidateRootPairInput {
  sourceRoot: string;
  targetRoot: string;
}

export type RootPairValidationResult =
  | { ok: true }
  | {
      ok: false;
      reason: string;
    };

export class FileAccessError extends Error {
  readonly path: string;
  readonly reason: string;

  constructor(input: { path: string; reason: string }) {
    super(`${input.path}: ${input.reason}`);
    this.name = "FileAccessError";
    this.path = input.path;
    this.reason = input.reason;
  }
}

export function createMemoryFileAccess(files: Record<string, Uint8Array>): FileAccessAdapter {
  const filesByPath = new Map<string, Uint8Array>();

  for (const [path, bytes] of Object.entries(files)) {
    filesByPath.set(normalizeRelativePath(path), bytes.slice());
  }

  return {
    async readFile(path) {
      const normalizedPath = normalizeRelativePath(path);
      const bytes = filesByPath.get(normalizedPath);
      if (!bytes) {
        throw new FileAccessError({
          path: normalizedPath,
          reason: "File not found"
        });
      }

      return bytes.slice();
    }
  };
}

export function createBrowserFileAccess(root: BrowserDirectoryHandle): FileAccessAdapter {
  return {
    async readFile(path) {
      const normalizedPath = normalizeRelativePath(path);
      const parts = normalizedPath.split("/").filter(Boolean);

      try {
        let directory = root;
        for (const directoryName of parts.slice(0, -1)) {
          directory = await directory.getDirectoryHandle(directoryName);
        }

        const fileHandle = await directory.getFileHandle(parts.at(-1) ?? "");
        const file = await fileHandle.getFile();
        return new Uint8Array(await file.arrayBuffer());
      } catch (error) {
        if (isNotFoundError(error)) {
          throw new FileAccessError({
            path: normalizedPath,
            reason: "File not found"
          });
        }

        throw error;
      }
    }
  };
}

export function validateRootPair(input: ValidateRootPairInput): RootPairValidationResult {
  const sourceRoot = normalizeRootPath(input.sourceRoot);
  const targetRoot = normalizeRootPath(input.targetRoot);

  if (!sourceRoot || !targetRoot) {
    return {
      ok: false,
      reason: "sourceRoot and targetRoot are required"
    };
  }

  if (sourceRoot === targetRoot) {
    return {
      ok: false,
      reason: "sourceRoot and targetRoot must be different"
    };
  }

  if (isPathInside(targetRoot, sourceRoot)) {
    return {
      ok: false,
      reason: "targetRoot must not be inside sourceRoot"
    };
  }

  if (isPathInside(sourceRoot, targetRoot)) {
    return {
      ok: false,
      reason: "sourceRoot must not be inside targetRoot"
    };
  }

  return { ok: true };
}

export function resolveTargetPath(sourceRelativePath: string): string {
  return normalizeRelativePath(sourceRelativePath);
}

function normalizeRelativePath(path: string): string {
  return path.replaceAll("\\", "/").replace(/^\/+/, "").replace(/\/+/g, "/");
}

function normalizeRootPath(path: string): string {
  return path
    .replaceAll("\\", "/")
    .replace(/\/+/g, "/")
    .replace(/\/$/, "")
    .toLowerCase();
}

function isPathInside(path: string, possibleParent: string): boolean {
  return path.startsWith(`${possibleParent}/`);
}

function isNotFoundError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "NotFoundError";
}
