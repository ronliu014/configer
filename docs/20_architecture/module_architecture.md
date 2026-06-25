# 模块架构

状态：Active

本文定义 `configer` 的模块边界和依赖规则。目标是让 `equip` 作为首个业务线独立演进，同时把可复用能力沉淀到平台层，避免后续扩展时重复设计。

## 分层结构

```text
src/
  app/
  core/
  shared/
  modules/
    equip/
    item/
    language/
```

## app 层

`app` 是应用外壳，负责启动、布局、导航、模块注册、全局会话状态和错误提示。

职责：

- 渲染配置中心侧边栏和顶部状态栏。
- 管理“未加载 / 已加载 / 待写回 / 已写回”等全局状态。
- 调用模块注册信息生成入口。
- 触发加载、写回、变更预览等平台动作。

限制：

- 不写具体业务编码规则。
- 不直接操作 Excel 单元格。
- 不直接读取某个模块的私有文件。

## core 层

`core` 是平台能力层，面向所有模块提供稳定 API。

建议能力：

| 能力 | 说明 |
|---|---|
| `fileAccess` | 目录选择、权限恢复、文件读取和写入 |
| `excelParser` | 解析 workbook、sheet、4 行表头协议和源行号 |
| `schemaRegistry` | 合并表头 schema 与模块显式 schema |
| `tableStore` | 管理内存表数据、主键索引、baseline |
| `validationEngine` | 执行引用存在性校验和后续链路对账 |
| `diffEngine` | 计算当前数据相对 baseline 的差异 |
| `writeBackEngine` | 逐单元格写回允许修改的字段 |
| `backupService` | 写回前复制原文件 |
| `changelogService` | 生成结构化变更记录 |

`core` 不依赖任何业务模块。业务差异通过 schema、规则配置和模块注册信息传入。

## shared 层

`shared` 保存跨模块复用的 UI、类型和工具函数。

示例：

- 通用表格、筛选栏、详情字段块、关联抽屉。
- 状态徽标、只读字段、错误提示。
- 通用类型，例如 `TableSchema`、`FieldSchema`、`ChangeSet`。
- 无业务含义的格式化工具。

`shared` 可以依赖 `core` 的类型，但不依赖 `modules`。

## modules 层

`modules/<domain>` 保存业务模块自身能力。每个模块必须能被独立理解、测试和禁用。

一个模块建议包含：

```text
modules/equip/
  index.ts
  schema/
  pages/
  services/
  validators/
  README.md
```

职责：

- 声明模块入口、导航名称、依赖表和可写表。
- 维护本模块 schema、控件映射和业务规则。
- 提供列表、详情、编辑等页面。
- 调用 `core` 执行加载、校验、diff 和写回。

限制：

- 不直接写本地文件。
- 不整表重建 workbook。
- 不越过 `core` 修改其它模块的数据。

## 模块注册契约

每个业务模块通过统一契约注册到配置中心。

```ts
type ConfigModule = {
  id: string;
  title: string;
  group: "business" | "common";
  tables: TableRequirement[];
  writableTables: string[];
  routes: ModuleRoute[];
};
```

`equip` v1.0 的 `writableTables` 只能包含 `equip`、`item`、`language`。装备关联表可以出现在 `tables` 中，但必须标记为只读。

## 依赖方向

```text
app -> modules -> core
app -> shared
modules -> shared
shared -> core types
core -> no modules
```

禁止依赖：

- `core -> modules`
- `shared -> modules`
- `modules/equip -> modules/role`
- 业务页面直接调用文件系统写入

跨模块引用必须通过公共表、schema 或 `core` 的表查询接口完成。例如 `equip` 需要查看 `item` 时，应读取已注册的 `item` 表数据，而不是调用 `item` 模块内部服务。

## v1.0 模块边界

| 模块 | v1.0 角色 | 写回 |
|---|---|---|
| `equip` | 主业务配置线 | 是 |
| `item` | 装备配套公共表 | 是 |
| `language` | 文案公共表 | 是 |
| 装备关联表 | 只读依赖表 | 否 |

后续 v1.1 如果开放关联表编辑，必须先把关联表能力纳入明确模块或 `equip` 子域，并同步更新 `writableTables` 和回写测试。
