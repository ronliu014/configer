# 数据生命周期

状态：Active

本文定义 `configer` 从加载本地 Excel 到生成目标文件的完整数据生命周期。所有实现必须以本流程为准，尤其是 `sourceRoot` 只读、`targetRoot` 镜像输出、baseline、diff、备份和 changelog。

## 生命周期总览

```text
选择 sourceRoot 和 targetRoot
  -> 从 sourceRoot 加载 workbook
  -> 解析表头和 schema
  -> 建立内存表与索引
  -> 建立 baseline
  -> 用户编辑
  -> 校验关联
  -> 生成 diff
  -> 预览变更
  -> 生成输出计划
  -> 备份 targetRoot 中已有目标文件
  -> 写入 targetRoot 镜像文件
  -> 生成 changelog
```

## 选择功能根目录

用户通过浏览器选择两个功能根目录：

- `sourceRoot`：输入根目录，只读加载现有配表，用于规则提取、baseline 和测试对比。
- `targetRoot`：目标根目录，写入 configer 生成的真实产物。

工具按模块声明从 `sourceRoot` 查找 `equip`、`item`、`language` 和装备关联表。仓库内 `source/` 只是本地样例资源目录，不能成为工具运行的固定依赖。

输出路径必须按源文件相对 `sourceRoot` 的路径镜像到 `targetRoot`。例如：

```text
sourceRoot/equip/equip.xlsx
  -> targetRoot/equip/equip.xlsx
sourceRoot/item/item.xlsx
  -> targetRoot/item/item.xlsx
```

v1.0 必须阻止 `sourceRoot` 与 `targetRoot` 相同或互相包含，避免产物覆盖源表。

加载结果必须记录：

- `sourceRoot` 句柄。
- `targetRoot` 句柄。
- 已找到的表。
- 缺失的表。
- 解析失败的表。
- 权限状态。

## 加载 workbook

每个 Excel 文件加载后保留原始 workbook 对象。原始 workbook 是只读输入，不允许直接保存回 `sourceRoot`。

同一个文件可能包含多个 sheet。输出时必须按模块输出契约决定保留哪些 sheet、哪些表头和哪些字段。v1.0 对 `equip`、`item`、`language` 输出协议兼容文件，不要求保留 Excel 公式。

## 解析 schema

工具按 4 行表头协议解析基础字段：

1. 中文名。
2. 导出标记。
3. 类型。
4. 字段名。

随后叠加模块显式 schema，得到稳定字段 key、控件类型、来源分类、引用关系、是否可写和回写定位信息。

字段来源决定回写行为：

| 来源 | 行为 |
|---|---|
| `manual` 手填字段 | 可编辑，输出为静态值 |
| `generated` 系统生成字段 | 不可手填，由规则计算后输出为静态值 |
| `formula` 原 Excel 公式字段 | 仅用于规则追溯，不作为输出运行机制 |
| `ref` 关联字段 | 默认只读，除非 schema 明确标记为手填引用 |
| `imported` 外部导入字段 | 默认只读，由来源表或生成规则决定输出 |
| `hidden` / `deprecated` | 默认不编辑，不作为新增规则依据 |

## 建立内存表与索引

每行数据需要记录业务主键、源行号、字段值和源文件信息。主键索引用于快速查找关联是否存在，例如 `equipId -> row`、`itemId -> row`、`languageKey -> row`。

v1.0 至少需要以下索引：

- 装备 ID 索引。
- item ID 索引。
- language Key 索引。
- 装备关联表主键集合。

## baseline

baseline 是加载完成后的原始快照，用于计算本次会话 diff。用户所有新增、修改、删除都与 baseline 比较，而不是与上一次操作比较。

baseline 不应被页面编辑直接修改。保存操作只更新当前工作数据。

## 编辑

编辑发生在内存中。页面提交的是结构化变更，不直接修改 workbook。

变更类型：

- 新增行。
- 修改字段。
- 删除行。

每次编辑后应更新当前表数据和相关索引。v1.0 的关联校验可以即时重算当前装备；列表不需要跑完整链路对账。

## 校验

v1.0 校验范围是引用主键存在性：

- 存在：显示目标条目并允许只读下钻。
- 不存在：显示悬空异常，列出目标表和目标主键。

完整命中、缺失、异常三态和反向索引增量对账属于 v1.1 范围。

## diff 与预览

输出前，`diffEngine` 对当前数据和 baseline 进行比较，生成变更预览。

预览粒度：

- 表名。
- 行主键。
- 操作类型：新增、修改、删除。
- 字段 key 和显示名。
- 旧值与新值。

用户取消输出时，diff 仍保留在内存中，不落盘，不生成 changelog。

## 输出计划

写入文件前，`core` 根据 diff、schema 和模块输出契约生成输出计划。

输出计划必须包含：

- 源文件相对 `sourceRoot` 的路径。
- 目标文件相对 `targetRoot` 的路径。
- 输出 sheet。
- 输出字段顺序。
- 每个字段的来源：`manual`、`generated`、`ref` 等。
- 新增、修改、删除行的处理方式。

## 备份

备份必须发生在覆盖 `targetRoot` 已有目标文件之前。备份失败时，输出必须停止。

备份文件名应包含原文件名和时间戳，方便回滚。备份目录应位于 `targetRoot` 或其旁路备份区，不能写入 `sourceRoot`。

## 输出

输出由 `core` 统一执行。业务模块不得绕过 `core` 直接写文件。

输出步骤：

1. 根据 diff 过滤出允许输出的表。
2. 根据 schema 和输出契约过滤字段。
3. 用 `sourceRoot` 中的表头和 schema 确定输出 sheet、字段顺序和类型。
4. 写入 `manual` 字段的当前值。
5. 写入 `generated` 字段的规则计算值。
6. 不把原 Excel 公式作为输出依赖。
7. 保存到 `targetRoot` 镜像相对路径。

v1.0 只输出 `equip`、`item`、`language`。装备关联表加载为只读，不能出现在输出变更集合中。

## changelog

输出成功后生成 changelog。changelog 与变更预览使用同一份 diff 数据，避免“预览看到的”和“记录写出的”不一致。

changelog 应包含：

- 输出时间。
- 涉及表。
- 新增、修改、删除统计。
- 每条变更的行主键、字段、旧值、新值。
- 输出文件位置。
- 备份文件位置。

## 失败恢复

| 阶段 | 失败处理 |
|---|---|
| 加载失败 | 不进入可编辑状态 |
| 编辑失败 | 保持原当前数据，提示字段错误 |
| diff 失败 | 阻止输出 |
| 输出计划失败 | 阻止输出 |
| 备份失败 | 阻止覆盖目标文件 |
| 输出失败 | 保留内存变更，提示失败位置，用户可重试 |
| changelog 失败 | 标记输出已完成但记录失败，提示用户人工记录 |
