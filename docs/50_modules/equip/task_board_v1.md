# equip v1.0 任务进度表

状态：Active

本文是 `equip` 装备配置 v1.0 MVP 的持续进度记录。后续开发无论是否中断，都应先阅读本文，再继续执行 [implementation_plan_v1.md](implementation_plan_v1.md)。

## 使用规则

- 每完成一个阶段，必须更新本文。
- 每次更新必须记录提交号、验证命令、结果摘要和遗留风险。
- 如果阶段被阻塞，状态标记为 `Blocked`，并写清阻塞条件和需要谁处理。
- 如果阶段范围变化，先更新 [implementation_plan_v1.md](implementation_plan_v1.md)，再更新本文。
- `source/` 不纳入提交；若阶段使用真实样例，只记录使用路径和验证结论。

## 状态说明

| 状态 | 含义 |
|---|---|
| `Not Started` | 尚未开始 |
| `In Progress` | 正在执行 |
| `Blocked` | 被外部条件或技术验证阻塞 |
| `Done` | 已完成并提交 |
| `Skipped` | 经文档确认后跳过 |

## 当前总览

| 项 | 当前值 |
|---|---|
| 当前阶段 | 阶段 5：source / target 会话加载 |
| 当前状态 | `Not Started` |
| 最近完成阶段提交 | `ac4aee3 Harden table baseline snapshots` |
| 下一步 | 实现 sourceRoot / targetRoot 选择后的加载会话、文件访问抽象和 workbook 读取 |
| 当前阻塞 | 无 |
| 注意事项 | 阶段 1 Excel 输出契约技术验证不得跳过 |
| 最近规划调整 | sourceRoot 只读、targetRoot 镜像输出；旧 equip 分析资料移入 `docs/90_reference/equip_reference/` |

## 阶段进度

| 阶段 | 名称 | 状态 | 目标提交 | 验证证据 | 备注 |
|---|---|---|---|---|---|
| 0 | 脚手架与开发命令 | `Done` | `5043b37 Scaffold local web app` | `npm test`、`npm run build`、`npm run dev -- --host 127.0.0.1 --port 5173 --clearScreen false` | 已建立 Vite + React + TypeScript、Vitest、基础目录 |
| 1 | Excel 输出契约技术验证 | `Done` | `23fbd79 Verify Excel target output contract` | `npm test -- tests/core/excel/targetWriter.test.ts`、`npm test`、`npm run build`、`npm audit --omit=dev` | SheetJS 能满足基础输出契约；`xlsx` 存在 no fix available high severity audit 风险 |
| 2 | 核心类型与 4 行表头解析 | `Done` | `348fe47 Add Excel header parser` | `npm test -- tests/core/excel/headerProtocol.test.ts`、`npm test`、`npm run build`、`npm audit --omit=dev` | 已解析 4 行表头，记录 `srcCol` / `srcName` 与结构化错误 |
| 3 | schema registry 与模块注册 | `Done` | `f71519f Add schema and module registry` | `npm test -- tests/core/schema/schemaRegistry.test.ts`、`npm test`、`npm run build`、`npm audit --omit=dev` | 已注册 `equip`、`item`、`language`，9 个装备关联表只读 |
| 4 | table store、baseline 与索引 | `Done` | `ac4aee3 Harden table baseline snapshots` | `npm test -- tests/core/table/tableStore.test.ts`、`npm test`、`npm run build`、`npm audit --omit=dev` | 已实现内存表、baseline 防御性快照、主键索引和增删改；`xlsx` audit 风险仍存在 |
| 5 | source / target 会话加载 | `Not Started` | `Add local table loading session` | 未执行 | 不硬编码仓库内 `source/` 路径 |
| 6 | equip / item / language 最小 schema | `Not Started` | `Add v1 equip schemas` | 未执行 | 字段使用稳定逻辑 key |
| 7 | 配置中心外壳与导航 | `Not Started` | `Add configuration center shell` | 未执行 | 参考产品样例页面，不复制 mock 逻辑 |
| 8 | 装备列表 | `Not Started` | `Add equip list page` | 未执行 | 搜索、筛选、分页，大表查找用 `Map` / `Set` |
| 9 | 装备新增、编辑、删除 | `Not Started` | `Add equip edit workflow` | 未执行 | 新增撞 ID 拦截，编辑更新原行 |
| 10 | item 与 language 维护 | `Not Started` | `Add item and language editing` | 未执行 | 支持配套 item 和文案编辑 |
| 11 | 只读关联抽屉与存在性校验 | `Not Started` | `Add read-only relation drawer` | 未执行 | 关联表只读，不补建 |
| 12 | diff、变更预览和 changelog | `Not Started` | `Add diff and changelog generation` | 未执行 | 预览和 changelog 使用同一份 diff |
| 13 | target 输出与备份 | `Not Started` | `Add safe target output` | 未执行 | v1.0 只输出 `equip`、`item`、`language` |
| 14 | 端到端验收 | `Not Started` | `Validate equip v1 MVP workflow` | 未执行 | `npm test`、`npm run build` 和输出契约验证必须通过 |

## 阶段记录模板

完成或阻塞任一阶段时，在下方追加记录。

```markdown
### 阶段 N：阶段名称

- 状态：Done | Blocked
- 提交：`<commit hash> <commit title>`
- 时间：YYYY-MM-DD HH:mm
- 变更范围：
  - `<path>`
- 验证：
  - `<command>`：通过 / 失败，摘要
- 结果：
  - 完成了什么
- 遗留风险：
  - 无 / 风险说明
- 下一步：
  - 阶段 N+1：阶段名称
```

## 阶段记录

### 规划阶段：阶段性总结与实现计划

- 状态：Done
- 提交：`17ffaec Add equip MVP implementation plan`
- 时间：2026-06-25
- 变更范围：
  - `docs/00_project/stage_summary_2026_06_25.md`
  - `docs/50_modules/equip/implementation_plan_v1.md`
  - `docs/50_modules/equip/README.md`
  - `docs/README.md`
- 验证：
  - `rg -n "TB[D]|TO[D]O|待[定]|以后再[写]|implement late[r]|fill in detail[s]" docs`：无命中
  - `git diff --check`：通过
- 结果：
  - 阶段性总结和 MVP 实现计划已建立。
  - 明确阶段 1 Excel 输出契约技术验证不得跳过。
- 遗留风险：
  - 尚未开始代码实现。
  - 尚未验证 SheetJS 是否满足 source 读取与 target 输出契约。
- 下一步：
  - 阶段 0：脚手架与开发命令。

### 规划调整：source / target 输出契约与 equip 标准目录

- 状态：Done
- 提交：`09e2688 Standardize equip source target documentation`
- 时间：2026-06-25
- 变更范围：
  - `docs/40_game_config/equip/`
  - `docs/90_reference/equip_reference/`
  - `docs/20_architecture/`
  - `docs/30_development/`
  - `docs/10_product/`
  - `docs/50_modules/equip/`
- 验证：
  - `rg -n "写[回]|配表目[录]|保留公[式]|公式列仍是公[式]" docs/10_product docs/20_architecture docs/30_development docs/40_game_config docs/50_modules docs/README.md AGENTS.md`
  - `rg -n "TB[D]|TO[D]O|待[定]|以后再[写]|implement late[r]|fill in detail[s]" docs`
  - `git diff --check`
  - `git ls-files source`
- 结果：
  - 明确 `sourceRoot` 只读，`targetRoot` 按 source 相对路径 1:1 镜像输出。
  - 明确原 Excel 公式只作为规则提取来源，target 输出写 configer 计算后的静态值。
  - 将旧版 equip 逆向分析、公式拆解、demo 和历史设计资料迁移到 `docs/90_reference/equip_reference/`。
  - 按 `docs/40_game_config/_template/` 重建标准化 `docs/40_game_config/equip/`。
  - current docs 旧输出语义扫描无命中；占位词扫描无命中；`git diff --check` 无空白错误；`source/` 未被 Git 跟踪。
- 遗留风险：
  - 标准化字段字典仍需在阶段 6 结合真实源表进一步细化到准确 `srcCol`。
- 下一步：
  - 阶段 0：脚手架与开发命令。

### 阶段 0：脚手架与开发命令

- 状态：Done
- 提交：`5043b37 Scaffold local web app`
- 时间：2026-06-25 16:33
- 变更范围：
  - `package.json`
  - `package-lock.json`
  - `index.html`
  - `vite.config.ts`
  - `vitest.config.ts`
  - `tsconfig.json`
  - `src/app/`
  - `src/core/`
  - `src/shared/`
  - `src/modules/equip/`
  - `src/modules/item/`
  - `src/modules/language/`
  - `tests/app/`
  - `README.md`
  - `.gitignore`
- 验证：
  - `npm test -- tests/app/App.test.tsx`：通过，1 个 App shell smoke test 通过。
  - `npm test`：通过，1 个测试文件、1 个测试通过。
  - `npm run build`：通过，TypeScript 检查与 Vite production build 成功。
  - `npm run dev -- --host 127.0.0.1 --port 5173 --clearScreen false`：启动成功；Vite 输出 `ready` 与本地地址，因开发服务器为常驻进程，验证命令在 10 秒后由工具超时停止。
  - `git diff --cached --check`：通过，无空白错误。
  - `git ls-files source`：无输出，`source/` 未被 Git 跟踪。
- 结果：
  - 创建了本地 Web 工程脚手架，使用 Vite、React、TypeScript 和 Vitest。
  - 建立了 `npm run dev`、`npm run build`、`npm test`。
  - 建立了 `src/app/`、`src/core/`、`src/shared/`、`src/modules/equip/`、`src/modules/item/`、`src/modules/language/` 和 `tests/` 基础目录。
  - 添加了最小配置中心页面，展示业务配置与公共配置分组；未加载 sourceRoot / targetRoot 前禁用业务入口。
  - 页面不读取仓库内 `source/` 固定路径。
- 遗留风险：
  - 阶段 0 未实现 Excel 读取、输出、备份或 changelog；这些能力必须从阶段 1 的输出契约技术验证开始。
  - 尚未验证 SheetJS 是否满足 target 输出契约。
- 下一步：
  - 阶段 1：Excel 输出契约技术验证。

### 阶段 1：Excel 输出契约技术验证

- 状态：Done
- 提交：`23fbd79 Verify Excel target output contract`
- 时间：2026-06-25 16:47
- 变更范围：
  - `package.json`
  - `package-lock.json`
  - `src/core/excel/targetWriter.ts`
  - `tests/core/excel/targetWriter.test.ts`
  - `tests/fixtures/workbookFixture.ts`
- 验证：
  - `npm test -- tests/core/excel/targetWriter.test.ts`：通过，2 个 target 输出契约测试通过。
  - `npm test`：通过，2 个测试文件、3 个测试通过。
  - `npm run build`：通过，TypeScript 检查与 Vite production build 成功。
  - `git diff --check`：通过，无空白错误。
  - `git ls-files source`：无输出，`source/` 未被 Git 跟踪。
  - `npm audit --omit=dev`：失败，`xlsx` 存在 1 个 high severity advisory，当前 npm registry 报告 no fix available。
- 结果：
  - 增加 SheetJS `xlsx` 依赖并完成最小 workbook fixture。
  - 验证 target 输出路径可按 source 相对路径镜像生成。
  - 验证 4 行表头、sheet 名称、字段顺序、导出标记和类型行可保留。
  - 验证 `manual` 字段和 `generated` 字段可写为静态值。
  - 验证原公式列不会作为 target 输出机制保留；未更新公式单元格会剥离公式并保留静态缓存值。
  - 验证 `sourceBytes` 需复制后再传给 SheetJS 读取，否则读取过程会改变调用方持有的 `Uint8Array`。
- 遗留风险：
  - `xlsx@0.18.5` 存在 high severity `Prototype Pollution` 与 `ReDoS` advisory，且 npm audit 报告 no fix available；后续如处理不可信 Excel 或安全边界提升，必须评估替换 Excel 库或隔离解析环境。
  - 当前 `targetWriter` 只是阶段 1 技术验证最小实现，尚未接入 schema、diff、备份、changelog、真实 File System Access API 或 sourceRoot / targetRoot 包含关系校验。
- 下一步：
  - 阶段 2：核心类型与 4 行表头解析。

### 阶段 2：核心类型与 4 行表头解析

- 状态：Done
- 提交：`348fe47 Add Excel header parser`
- 时间：2026-06-25 16:54
- 变更范围：
  - `src/core/excel/headerProtocol.ts`
  - `src/core/schema/schemaTypes.ts`
  - `tests/core/excel/headerProtocol.test.ts`
- 验证：
  - `npm test -- tests/core/excel/headerProtocol.test.ts`：通过，4 个表头协议解析测试通过。
  - `npm test`：通过，3 个测试文件、7 个测试通过。
  - `npm run build`：通过，TypeScript 检查与 Vite production build 成功。
  - `git diff --check`：通过，无空白错误。
  - `git ls-files source`：无输出，`source/` 未被 Git 跟踪。
  - `npm audit --omit=dev`：失败，仍为阶段 1 已记录的 `xlsx` high severity advisory，当前 npm registry 报告 no fix available。
- 结果：
  - 定义了 `RawColumnMeta` 和字段来源基础类型。
  - 定义了 `HeaderProtocolResult` 和结构化 `ParseHeaderError`。
  - 实现 `parseHeaderRows(rows, { sheetName })`，按 4 行表头解析 `srcLabel`、`flag`、`type`、`srcName` 并记录 `srcCol`。
  - 少于 4 行表头时抛出包含 sheet、行、列、原因的结构化错误。
  - 缺失第 4 行源字段名时抛出结构化错误。
  - 重复 `srcName` 不覆盖列，保留为独立 `RawColumnMeta` 条目；未把 `Remark*` 当成稳定业务 key。
- 遗留风险：
  - 当前解析器只完成表头协议解析，不包含 schema 合并、字段可编辑性、引用关系、主键索引或 workbook 加载流程。
  - `xlsx@0.18.5` audit high severity 风险仍存在，后续阶段继续按阶段 1 风险记录处理。
- 下一步：
  - 阶段 3：schema registry 与模块注册。

### 阶段 3：schema registry 与模块注册

- 状态：Done
- 提交：`f71519f Add schema and module registry`
- 时间：2026-06-25 17:06
- 变更范围：
  - `src/core/schema/schemaTypes.ts`
  - `src/core/schema/schemaRegistry.ts`
  - `src/app/moduleRegistry.ts`
  - `src/modules/equip/index.ts`
  - `src/modules/item/index.ts`
  - `src/modules/language/index.ts`
  - `tests/core/schema/schemaRegistry.test.ts`
- 验证：
  - `npm test -- tests/core/schema/schemaRegistry.test.ts`：通过，6 个 schema registry 与模块注册测试通过。
  - `npm test`：通过，4 个测试文件、13 个测试通过。
  - `npm run build`：通过，TypeScript 检查与 Vite production build 成功。
  - `git diff --check`：通过，无空白错误。
  - `git ls-files source`：无输出，`source/` 未被 Git 跟踪。
  - `npm audit --omit=dev`：失败，仍为阶段 1 已记录的 `xlsx` high severity advisory，当前 npm registry 报告 no fix available。
- 结果：
  - 定义了 `FieldSchema`、`TableSchema`、`ConfigModule`、`DependencyTable`、`FieldRef` 和 `FieldControl`。
  - 实现 `mergeTableSchema(rawColumns, explicitSchema)`，把 4 行表头元数据合并到显式 schema 字段。
  - schema 合并后可通过稳定 `key` 使用字段，同时保留 `srcName`、`srcCol`、`srcLabel`、`flag` 和 `type` 等源信息。
  - 显式 schema 引用缺失源列时抛出结构化定位信息。
  - 重复 `srcName` 时保留第一个匹配源列，不覆盖为后续重复列。
  - 注册 `equip`、`item`、`language` 模块。
  - `equip` v1.0 `targetTables` 限定为 `equip`、`item`、`language`。
  - 按 `docs/40_game_config/equip/01_source_tables.md` 注册 9 个装备只读依赖表，且不进入 target 输出集合。
- 遗留风险：
  - 当前阶段只建立 schema registry 和模块表边界，尚未实现真实字段 schema、table store、baseline、diff、备份或输出会话。
  - `xlsx@0.18.5` audit high severity 风险仍存在，后续阶段继续按阶段 1 风险记录处理。
- 下一步：
  - 阶段 4：table store、baseline 与索引。

### 阶段 4：table store、baseline 与索引

- 状态：Done
- 提交：`0aecef0 Add table store and baseline`、`ac4aee3 Harden table baseline snapshots`
- 时间：2026-06-25 17:15
- 变更范围：
  - `src/core/table/tableTypes.ts`
  - `src/core/table/tableStore.ts`
  - `tests/core/table/tableStore.test.ts`
- 验证：
  - `npm test -- tests/core/table/tableStore.test.ts`：通过，1 个测试文件、6 个 table store 行为测试通过。
  - `npm test`：通过，5 个测试文件、19 个测试通过。
  - `npm run build`：通过，TypeScript 检查与 Vite production build 成功。
  - `git diff --check`：通过，无空白错误。
  - `git ls-files source`：无输出，`source/` 未被 Git 跟踪。
  - `npm audit --omit=dev`：失败，仍为阶段 1 已记录的 `xlsx` high severity advisory，当前 npm registry 报告 no fix available。
- 结果：
  - 定义了 `TableRow`、`TableData`、`TableIndex`、`BaselineSnapshot`、`TablePrimaryKey` 和基础单元格值类型。
  - 实现 `createTableStore(tables)`，初始化时为当前数据和 baseline 分别克隆表数据。
  - `getBaseline()` 返回防御性快照，调用方修改返回对象不会污染内部 baseline。
  - 支持按表名和业务主键查询当前行。
  - 新增、修改、删除内存行后同步维护主键索引。
  - 初始化和新增行遇到重复主键时抛出包含 `tableName`、`primaryKey` 和 `reason` 的 `TableStoreError`。
  - 删除缺失行返回 `false`，不修改当前数据或 baseline。
- 遗留风险：
  - 当前阶段只实现通用内存表能力，尚未接入 workbookReader、sourceRoot / targetRoot 文件访问、diff、输出备份或 UI。
  - 当前 API 不支持修改业务主键；后续编辑流程如允许变更主键，需要显式设计索引迁移和冲突处理。
  - `xlsx@0.18.5` audit high severity 风险仍存在，后续阶段继续按阶段 1 风险记录处理。
- 下一步：
  - 阶段 5：source / target 会话加载。

## 恢复工作指引

上下文丢失或中断后，按以下顺序恢复：

1. 执行 `git status --short --branch`，确认当前分支和未提交改动。
2. 阅读本文的“当前总览”和“阶段进度”。
3. 阅读最近一条“阶段记录”。
4. 打开 [implementation_plan_v1.md](implementation_plan_v1.md)，进入下一阶段。
5. 执行阶段前检查：
   - 当前阶段不是 `Done`。
   - 没有未确认的用户改动。
   - `source/` 不纳入提交。
6. 完成阶段后更新本文、运行验证命令、提交并推送。
