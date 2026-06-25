# equip v1.0 MVP 实现计划

状态：Active

本文定义 `equip` 装备配置 MVP 的开发前实现计划。计划目标是把文档中的产品和技术边界拆成可执行任务，后续开发应按任务顺序推进，每个阶段完成后提交一次。阶段进度、完成证据和中断恢复记录维护在 [task_board_v1.md](task_board_v1.md)。

## 执行方式

本文是模块级实现计划，用于确定开发顺序、文件边界、验收标准和风险关口。进入具体编码时，每个阶段应再拆成更细的任务清单，遵守测试先行、频繁提交和阶段验收原则。

后续执行建议：

- 阶段 0 到阶段 1 必须先做，尤其是 Excel 输出契约技术验证。
- 每个阶段只处理该阶段声明的文件范围。
- 每个阶段完成后运行相关测试，更新 [task_board_v1.md](task_board_v1.md)，然后提交。
- 如果发现计划与真实配表或技术验证冲突，先更新本文和对应架构文档，再继续编码。

## 目标

实现一个本地 Web 版配置中心，完成 `equip` 装备配置 v1.0 闭环：

```text
选择 sourceRoot 和 targetRoot
  -> 加载 equip / item / language / 装备关联表
  -> 展示装备列表
  -> 新增 / 编辑 / 删除装备
  -> 维护配套 item 和 language
  -> 只读查看关联表并检查主键存在性
  -> 生成变更预览
  -> 输出 equip / item / language 到 targetRoot 镜像路径
  -> 生成 changelog
```

## 技术路线

| 项 | 选择 |
|---|---|
| 应用形态 | 本地 Web 单页应用 |
| 推荐脚手架 | Vite + React + TypeScript |
| Excel 处理 | 先验证 SheetJS 是否满足 source 读取和 target 输出契约；输出不依赖保留原公式 |
| 测试 | Vitest + jsdom；关键 UI 流程后续接 Playwright |
| 文件访问 | File System Access API，用户选择 `sourceRoot` 与 `targetRoot`，测试中使用内存实现 |
| 状态 | v1.0 使用 React state + 模块 service，暂不引入复杂状态库 |

## 版本边界

v1.0 只做：

- `equip`、`item`、`language` 三类表增删改。
- 装备关联表只读加载、查看和主键存在性校验。
- 输出 `equip`、`item`、`language` 到 `targetRoot`。
- 覆盖 target 目标文件前备份，输出后生成 changelog。

v1.0 不做：

- 关联表编辑或补建。
- 完整链路三态对账。
- 反向索引增量刷新。
- 批量导入。
- AI 辅助规则编写。
- 自动 SVN 提交。

## 目标目录

```text
src/
  app/
    App.tsx
    moduleRegistry.ts
    sessionState.ts
  core/
    excel/
      headerProtocol.ts
      workbookReader.ts
      targetWriter.ts
    schema/
      schemaTypes.ts
      schemaRegistry.ts
    table/
      tableTypes.ts
      tableStore.ts
    validation/
      refValidator.ts
    diff/
      diffEngine.ts
      changelog.ts
    file/
      fileAccess.ts
  shared/
    components/
    styles/
  modules/
    equip/
      index.ts
      schema/
      services/
      pages/
      components/
    item/
      index.ts
      schema/
      services/
      pages/
    language/
      index.ts
      schema/
      services/
      pages/
tests/
  core/
  modules/
  fixtures/
```

## 阶段 0：脚手架与开发命令

目标：创建最小可运行前端工程，建立测试、构建和静态运行命令。

任务：

1. 创建 Vite + React + TypeScript 项目结构。
2. 增加 `npm run dev`、`npm run build`、`npm test`。
3. 建立 `src/app/`、`src/core/`、`src/shared/`、`src/modules/`、`tests/` 目录。
4. 添加一个空的配置中心页面，左侧显示业务配置和公共配置分组。

验收：

- `npm run dev` 能启动本地页面。
- `npm run build` 成功。
- `npm test` 能执行至少一个 smoke test。
- 页面不读取 `source/` 固定路径。

提交建议：

```text
Scaffold local web app
```

## 阶段 1：Excel 输出契约技术验证

目标：在正式实现业务前，验证 Excel 库能否满足 source 读取和 target 输出契约。

任务：

1. 在 `tests/fixtures/` 准备一个最小 workbook fixture，包含：
   - 4 行表头。
   - 1 个原公式列。
   - 1 个手填列。
   - 1 个 generated 字段预期值。
   - 2 个 sheet。
2. 编写 `tests/core/excel/targetWriter.test.ts`。
3. 验证从 `sourceRoot` 读取后输出到 `targetRoot`：
   - `sourceRoot` 文件未被修改。
   - target 文件按 source 相对路径镜像生成。
   - 4 行表头、sheet 名称、字段顺序和导出标记保留。
   - `manual` 字段写用户编辑后的静态值。
   - `generated` 字段写规则计算后的静态值。
   - 输出不依赖原 Excel 公式。
4. 如果 SheetJS 无法满足输出契约，记录结论并替换生成方案，不继续推进业务输出。

验收：

- 输出契约验证测试通过。
- 如果验证失败，必须先更新 `docs/20_architecture/technical_design.md` 和本文，再继续实现。

提交建议：

```text
Verify Excel target output contract
```

## 阶段 2：核心类型与 4 行表头解析

目标：实现 Excel 表头协议解析，形成后续 schema 和 table store 的基础数据。

文件：

- `src/core/excel/headerProtocol.ts`
- `src/core/schema/schemaTypes.ts`
- `tests/core/excel/headerProtocol.test.ts`

任务：

1. 定义 `RawColumnMeta`、`HeaderProtocolResult`、`ParseHeaderError`。
2. 实现 `parseHeaderRows(rows)`：
   - 第 1 行解析 `srcLabel`。
   - 第 2 行解析 `flag`。
   - 第 3 行解析 `type`。
   - 第 4 行解析 `srcName`。
   - 记录 `srcCol`。
3. 测试正常 4 行表头。
4. 测试少于 4 行时报结构化错误。
5. 测试重复 `srcName` 不覆盖列，只作为源字段记录。

验收：

- 能解析 4 行表头协议。
- 不把 `Remark*` 当成稳定业务 key。
- 错误中包含行、列、原因。

提交建议：

```text
Add Excel header parser
```

## 阶段 3：schema registry 与模块注册

目标：把表头元数据和模块显式 schema 合并，建立模块可插拔基础。

文件：

- `src/core/schema/schemaRegistry.ts`
- `src/app/moduleRegistry.ts`
- `src/modules/equip/index.ts`
- `src/modules/item/index.ts`
- `src/modules/language/index.ts`
- `tests/core/schema/schemaRegistry.test.ts`

任务：

1. 定义 `FieldSchema`、`TableSchema`、`ConfigModule`。
2. 实现 `mergeTableSchema(rawColumns, explicitSchema)`。
3. `FieldSchema` 必须支持：
   - `key`
   - `srcName`
   - `srcCol`
   - `source`
   - `editable`
   - `control`
   - `ref`
4. 注册 `equip`、`item`、`language` 模块。
5. 将装备关联表注册为只读依赖表。

验收：

- schema 合并后以稳定 `key` 查询字段。
- `equip` v1.0 的 `targetTables` 仅包含 `equip`、`item`、`language`。
- 关联表不能进入 target 输出变更集合。

提交建议：

```text
Add schema and module registry
```

## 阶段 4：table store、baseline 与索引

目标：实现内存表数据、baseline、主键索引和基础查询能力。

文件：

- `src/core/table/tableTypes.ts`
- `src/core/table/tableStore.ts`
- `tests/core/table/tableStore.test.ts`

任务：

1. 定义 `TableRow`、`TableData`、`TableIndex`、`BaselineSnapshot`。
2. 实现 `createTableStore(tables)`。
3. 实现按表名和主键查行。
4. 实现 baseline 深拷贝。
5. 实现新增、修改、删除内存行。
6. 更新主键索引。

验收：

- 修改当前数据不会修改 baseline。
- 主键重复时报结构化错误。
- 删除行后索引同步更新。

提交建议：

```text
Add table store and baseline
```

## 阶段 5：source / target 会话加载

目标：完成用户选择 `sourceRoot` 和 `targetRoot` 后的加载会话，不依赖仓库内 `source/` 固定路径。

文件：

- `src/core/file/fileAccess.ts`
- `src/core/excel/workbookReader.ts`
- `src/app/sessionState.ts`
- `tests/core/file/fileAccess.test.ts`
- `tests/core/excel/workbookReader.test.ts`

任务：

1. 抽象 `FileAccessAdapter`：
   - 浏览器实现使用 File System Access API。
   - 测试实现使用内存文件。
2. 实现按模块表需求从 `sourceRoot` 查找文件。
3. 校验 `sourceRoot` 与 `targetRoot` 不能相同或互相包含。
4. 加载 `equip`、`item`、`language` 和装备关联表。
5. 记录加载结果：
   - 成功表。
   - 缺失表。
   - 解析失败表。
6. 建立 baseline。

验收：

- 表缺失时页面可显示具体缺失表。
- 未选择 source 或 target 目录时业务入口不可用。
- 加载逻辑不使用硬编码 `source/` 路径。
- 输出逻辑按 source 相对路径映射 target 路径。

提交建议：

```text
Add local table loading session
```

## 阶段 6：equip / item / language 最小 schema

目标：为 v1.0 页面和校验提供最小可用字段声明。

文件：

- `src/modules/equip/schema/equipSchema.ts`
- `src/modules/equip/schema/equipRelations.ts`
- `src/modules/item/schema/itemSchema.ts`
- `src/modules/language/schema/languageSchema.ts`
- `tests/modules/equip/equipSchema.test.ts`

任务：

1. 依据 `docs/40_game_config/equip/02_field_dictionary.md` 提取 v1.0 必需字段。
2. 依据 `docs/40_game_config/equip/04_relations.md` 声明关联表主键。
3. 标记字段来源：
   - 手填字段为 `manual`。
   - 由 configer 计算的字段为 `generated`。
   - 原 Excel 公式字段为 `formula`，仅用于规则追溯。
   - 关联字段为 `ref`。
4. 标记编辑权限和 target 输出策略。
5. 为 language 字段建立 `key -> Zhs` 显示规则。

验收：

- `equip` 手填字段可编辑。
- generated 字段只读，由规则计算后输出静态值。
- formula 字段不得作为 target 输出运行机制。
- 关联字段可下钻。
- `item` 和 `language` 在 v1.0 可写。

提交建议：

```text
Add v1 equip schemas
```

## 阶段 7：配置中心外壳与导航

目标：实现产品样例页面中的配置中心外壳。

文件：

- `src/app/App.tsx`
- `src/shared/components/Sidebar.tsx`
- `src/shared/components/HeaderBar.tsx`
- `src/shared/styles/app.css`
- `tests/app/App.test.tsx`

任务：

1. 实现左侧导航：
   - 业务配置：装备。
   - 公共配置：item、language。
2. 实现顶部加载状态。
3. 未加载时禁用业务入口。
4. 已加载后进入装备列表。

验收：

- 未加载状态不显示空业务列表。
- 导航分组与产品设计一致。
- demo 仅作为视觉参考，不复制 mock 数据。

提交建议：

```text
Add configuration center shell
```

## 阶段 8：装备列表

目标：实现装备列表、搜索、筛选和分页。

文件：

- `src/modules/equip/pages/EquipListPage.tsx`
- `src/modules/equip/services/equipListService.ts`
- `src/modules/equip/components/EquipQualityTag.tsx`
- `tests/modules/equip/equipListService.test.ts`

任务：

1. 展示装备 ID、备注、部位、职业、转数、品质、等级和状态。
2. 支持装备 ID / 备注搜索。
3. 支持职业、品质、转数、部位筛选。
4. 支持分页。
5. 大表查找使用 `Map` 或预处理索引，不在循环内使用 `indexOf` 查大集合。

验收：

- 搜索与筛选可组合。
- 重置筛选恢复全量列表。
- 每页数量稳定。

提交建议：

```text
Add equip list page
```

## 阶段 9：装备新增、编辑、删除

目标：实现装备内存增删改和生成预览。

文件：

- `src/modules/equip/pages/EquipEditPage.tsx`
- `src/modules/equip/services/equipEditService.ts`
- `src/modules/equip/services/equipEncodeRules.ts`
- `tests/modules/equip/equipEditService.test.ts`
- `tests/modules/equip/equipEncodeRules.test.ts`

任务：

1. 依据 `docs/40_game_config/equip/03_id_rules.md` 实现 v1.0 必需生成预览，必要时参考 `docs/90_reference/equip_reference/04_ID编码规则速查.md`。
2. 新增装备时检查装备 ID 冲突。
3. 编辑装备时允许保存自身 ID。
4. 编辑装备更新原行，不新增重复行。
5. 删除装备需要确认状态，确认前不修改数据。

验收：

- 生成预览随手填维度变化。
- 新增撞 ID 被阻止。
- 编辑不产生重复行。
- 删除操作可取消。

提交建议：

```text
Add equip edit workflow
```

## 阶段 10：item 与 language 维护

目标：实现装备配套 item 和 language 的 v1.0 编辑能力。

文件：

- `src/modules/item/pages/ItemPage.tsx`
- `src/modules/item/services/itemService.ts`
- `src/modules/language/pages/LanguagePage.tsx`
- `src/modules/language/services/languageService.ts`
- `tests/modules/item/itemService.test.ts`
- `tests/modules/language/languageService.test.ts`

任务：

1. 根据装备 ID 查找非绑 item 和绑定 item。
2. 展示 `BindItemId` / `UnBindItemId` 互指关系。
3. 支持新增和修改配套 item。
4. 根据 language Key 查中文文案。
5. 支持新增和修改中文文案。
6. 装备详情中 language 字段优先显示中文，Key 弱化展示。

验收：

- 未配置 language 时显示未配状态和 Key。
- item 互指异常时给出明确提示。
- item / language 变更进入 diff。

提交建议：

```text
Add item and language editing
```

## 阶段 11：只读关联抽屉与存在性校验

目标：实现装备关联字段只读下钻和主键存在性校验。

文件：

- `src/core/validation/refValidator.ts`
- `src/shared/components/RelationDrawer.tsx`
- `src/modules/equip/services/equipRelationService.ts`
- `tests/core/validation/refValidator.test.ts`
- `tests/modules/equip/equipRelationService.test.ts`

任务：

1. 实现 `validateRef(tableName, id)`。
2. 关联主键存在时返回目标条目。
3. 关联主键缺失时返回悬空异常。
4. 抽屉展示表名、主键、存在性状态和只读字段。
5. 支持面包屑下钻。
6. 抽屉不提供保存、删除、补建按钮。

验收：

- 存在的关联可查看。
- 缺失的关联明确显示目标表和主键。
- v1.0 不会写关联表。

提交建议：

```text
Add read-only relation drawer
```

## 阶段 12：diff、变更预览和 changelog

目标：实现输出前变更预览和输出后 changelog。

文件：

- `src/core/diff/diffEngine.ts`
- `src/core/diff/changelog.ts`
- `src/shared/components/ChangePreview.tsx`
- `tests/core/diff/diffEngine.test.ts`
- `tests/core/diff/changelog.test.ts`

任务：

1. 比较当前数据和 baseline。
2. 识别新增、修改、删除。
3. 输出表名、行主键、字段 key、字段显示名、旧值、新值。
4. 变更预览和 changelog 使用同一份 diff。
5. 用户取消输出时不落盘、不生成 changelog。

验收：

- diff 能覆盖 equip、item、language。
- changelog 与预览内容一致。
- 关联表不出现在 v1.0 target 输出 diff 中。

提交建议：

```text
Add diff and changelog generation
```

## 阶段 13：target 输出与备份

目标：完成 `equip`、`item`、`language` 三表 target 镜像输出。

文件：

- `src/core/excel/targetWriter.ts`
- `src/core/file/backupService.ts`
- `src/core/file/outputSession.ts`
- `tests/core/excel/targetWriter.test.ts`
- `tests/core/file/backupService.test.ts`

任务：

1. 覆盖 target 已有目标文件前生成备份。
2. 根据 diff 过滤允许输出表。
3. 根据 schema 过滤允许输出字段。
4. 将 source 相对路径映射到 target 相对路径。
5. 写入 `manual` 字段当前值。
6. 写入 `generated` 字段规则计算值。
7. 保存 target workbook。
8. 输出失败时保留内存变更并返回失败位置。

验收：

- v1.0 只输出 `equip`、`item`、`language`。
- `sourceRoot` 文件未被修改。
- target 文件按 source 相对路径镜像生成。
- generated 字段输出静态结果值。
- 备份失败时阻止覆盖 target 已有目标文件。
- 输出成功后生成 changelog。

提交建议：

```text
Add safe target output
```

## 阶段 14：端到端验收

目标：验证 v1.0 主流程。

任务：

1. 准备一套最小 Excel fixture。
2. 跑单元测试和集成测试。
3. 启动本地页面。
4. 验证流程：
   - 未加载状态。
   - 选择 `sourceRoot` 和 `targetRoot`。
   - 进入装备列表。
   - 新增装备。
   - 编辑配套 item。
   - 编辑 language。
   - 查看关联抽屉。
   - 打开变更预览。
   - 取消输出。
   - 执行输出到临时 target 目录。
   - 检查备份和 changelog。
5. 记录未覆盖风险。

验收：

- `npm test` 通过。
- `npm run build` 通过。
- Excel 输出契约测试通过。
- 手工验收记录写入提交说明或开发日志。

提交建议：

```text
Validate equip v1 MVP workflow
```

## 推荐执行顺序

1. 阶段 0：脚手架与开发命令。
2. 阶段 1：Excel 输出契约技术验证。
3. 阶段 2 到阶段 5：核心加载基建。
4. 阶段 6 到阶段 11：业务页面和校验。
5. 阶段 12 到阶段 13：diff、changelog、target 输出。
6. 阶段 14：端到端验收。

不得跳过阶段 1。若输出契约技术验证失败，不应继续开发会真实写 target 文件的功能。

## 开发前检查

开始写代码前必须确认：

- 已阅读 `docs/README.md` 推荐阅读顺序。
- 已阅读 `docs/40_game_config/equip/README.md` 及 01-09 标准文档。
- 已阅读 `docs/90_reference/excel_table_protocol.md`。
- 当前工作区没有未确认的用户改动。
- `source/` 不纳入提交。

## 交付标准

v1.0 完成时必须满足：

- 用户能选择 source 目录和 target 目录并加载装备相关表。
- 用户能增删改装备、配套 item 和 language。
- 关联表只读展示，缺失主键显示悬空异常。
- 输出前有变更预览，覆盖 target 已有目标文件前有备份。
- `sourceRoot` 不被修改，target 文件按 source 相对路径镜像生成。
- 公式逻辑已迁移为 generated 规则，target 输出写静态结果值。
- 输出后生成 changelog。
- `npm test` 和 `npm run build` 通过。
