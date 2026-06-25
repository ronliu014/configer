# 代码规范

状态：Active

本文定义 `configer` 后续开发的代码组织和实现约束。当前仓库尚未创建前端脚手架，本文先固定规则，具体格式化工具在脚手架落地后补充命令。

## 基本原则

- 业务模块隔离：修改 `modules/equip` 不应要求修改 `modules/role` 或其它未来模块。
- 平台能力集中：Excel 解析、schema 合并、diff、备份、target 输出必须位于 `core`。
- UI 与规则分离：页面负责展示和交互，编码、校验、输出规则放在 schema、service 或 validator 中。
- 真实规则来自文档：不要从 demo 的 mock 函数反推业务逻辑。

## 目录与依赖

目标代码目录遵守 [项目目录设计](../20_architecture/project_directory_design.md) 与 [模块架构](../20_architecture/module_architecture.md)。

依赖方向：

```text
app -> modules -> core
app -> shared
modules -> shared
shared -> core types
core -> no modules
```

禁止业务模块直接写文件。模块只能向 `core` 提交结构化变更请求，由 `core` 根据 schema 和输出契约生成 target 目标文件。

## 命名规则

- 目录名使用英文小写，例如 `modules/equip/`、`core/excel/`。
- 文件名使用英文小写加连字符或项目脚手架约定，例如 `write-back-engine.ts`。
- 类型、组件、类使用 `PascalCase`，例如 `TableSchema`、`EquipListPage`。
- 函数和变量使用 `camelCase`，例如 `parseWorkbook`、`equipSchema`。
- Excel 原始字段名只存入 `srcName`，代码逻辑使用稳定 key，例如 `equipId`。

## 字段与 schema

字段必须有稳定逻辑 key。禁止用 Excel 的 `Remark10` 这类源字段名作为业务判断条件。

schema 至少描述：

- 字段 key。
- Excel 源列 `srcCol` 和源名 `srcName`。
- 字段来源：`manual`、`generated`、`formula`、`ref`、`imported`、`hidden`。
- 控件类型。
- 是否可编辑、是否参与 target 输出。
- 引用表和引用主键。

新增字段时必须同步更新对应模块文档或游戏配置说明。

## Excel 输出红线

- 不修改 `sourceRoot` 中的源表。
- 不要求用户逐一配置目标文件路径；必须按相对 `sourceRoot` 的路径镜像到 `targetRoot`。
- 不把原 Excel 公式作为输出运行机制；公式逻辑应迁移为 `generated` 规则。
- 不跳过覆盖前备份。
- 不绕过 changelog。
- 不把关联表放进 v1.0 target 输出变更集合。

所有输出代码必须能回答：读取哪个 source 文件、生成哪个 target 文件、哪个 sheet、哪一行、哪一列、为什么允许输出。

## 错误处理

错误信息必须包含用户可行动的信息。

示例：

- 好：`equip_proplib 缺少主键 101007001，字段 属性库ID 无法下钻。`
- 差：`校验失败。`

文件、表头、schema、权限、备份、输出失败都必须返回结构化错误，不允许只在控制台打印。

## UI 实现约束

产品样例页面位于 [装备配置工具.html](../90_reference/equip_reference/demo/装备配置工具.html)。实现应参考它的布局和交互，但不要复制硬编码 mock 数据为生产逻辑。

UI 控件必须区分：

- 可编辑手填字段。
- 只读自动字段。
- 可下钻关联字段。
- 悬空异常字段。

## 注释规则

只给复杂业务规则、输出保护、编码规则和风险点写注释。不要给简单赋值、显而易见的 UI 状态写空洞注释。
