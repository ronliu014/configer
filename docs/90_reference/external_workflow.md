# 外部流程参考

状态：Active

本文记录 `configer` 与现有外部流程的关系。v1.0 工具只负责从 `sourceRoot` 加载、编辑、校验、生成到 `targetRoot`、备份目标文件和生成 changelog，不自动提交 SVN。

## 流程总览

```text
SVN update
  -> 选择 sourceRoot
  -> 选择 targetRoot
  -> configer 从 sourceRoot 加载 Excel
  -> 工具内编辑与校验
  -> 生成变更预览
  -> 生成 targetRoot 镜像输出
  -> 覆盖 targetRoot 已有目标文件前备份
  -> 生成 changelog
  -> ExcelMerge 或人工比对 sourceRoot 与 targetRoot
  -> 人工提交或外部提交工具
```

## SVN

现有配表通常位于 SVN 工作副本中。为了避免基于过期文件生成目标表，用户应在加载 `sourceRoot` 前先同步本地工作副本。

v1.0 不在浏览器内执行 `svn update`、`svn status` 或 `svn commit`。后续若要自动提交，需要引入轻量本地后端或独立脚本，并重新评估权限、日志和失败恢复。

## ExcelMerge

ExcelMerge 用于提交前的表格比对。它的角色是确认 `targetRoot` 中的目标表符合预期，并与 `sourceRoot` 中的基准表形成可解释差异。

v1.0 产品中可以展示“需要比对”的提示和 changelog，但不要求浏览器直接调用 ExcelMerge。

建议比对内容：

- 是否只改了预期表。
- `sourceRoot` 是否未被修改。
- `targetRoot` 是否按源文件相对路径 1:1 镜像生成。
- `manual` 字段是否来自用户编辑。
- `generated` 字段是否来自 configer 规则计算。
- 原 Excel 公式是否已被规则说明和静态结果替代。
- changelog 是否覆盖全部实际变更。

## excel-batch-commit

`excel-batch-commit` 是后续可对接的外部提交能力。`configer` v1.0 生成的 changelog 应能作为提交说明来源，但工具本身不自动调用该流程。

对接前需要确认：

- 提交前是否必须先执行 SVN update。
- 是否按表逐个提交。
- changelog 格式是否满足团队提交规范。
- 提交失败时如何回滚或重试。
- 是否需要人工确认。

## changelog 责任边界

`configer` 负责生成本次输出的结构化 changelog。changelog 应来自 diff 数据，而不是从生成后的 Excel 反推。

changelog 至少包含：

- 输出时间。
- 修改人或本地用户标识。
- 表名。
- 行主键。
- 字段名。
- 旧值和新值。
- 新增、修改、删除分类。
- 目标文件位置。
- 备份文件位置。

## 失败处理原则

| 阶段 | 原则 |
|---|---|
| SVN 同步失败 | 不应继续加载过期配表 |
| sourceRoot 与 targetRoot 冲突 | 不允许输出 |
| 备份失败 | 不允许覆盖 targetRoot 中已有目标文件 |
| 输出失败 | 保留内存变更，报告失败文件和单元格 |
| 比对失败 | 不应提交 |
| 提交失败 | 保留 changelog 和备份，等待人工处理 |

## v1.0 与后续版本

v1.0：

- 本地选择 `sourceRoot` 和 `targetRoot`。
- 从 `sourceRoot` 只读加载 Excel。
- 向 `targetRoot` 镜像生成 Excel。
- 覆盖目标文件前自动备份。
- 自动生成 changelog。
- 不自动 SVN 提交。

v2.0 可评估：

- 本地后端执行 SVN 命令。
- 自动调用 ExcelMerge 或批处理比对。
- 对接 `excel-batch-commit`。
- 提交前人工确认与失败恢复。
