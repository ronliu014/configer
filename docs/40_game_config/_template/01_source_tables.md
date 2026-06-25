# source 表清单

状态：Active

本文说明本模块从 `sourceRoot` 读取哪些 Excel 表。`sourceRoot` 只读，用于规则分析、baseline 和测试对比，不得被工具修改。

## 表清单

| 表 | 相对路径 | sheet | 主键 | 用途 | v1.0 权限 |
|---|---|---|---|---|---|
| `<table>` | `<module>/<table>.xlsx` | `<sheet>` | `<primaryKey>` | 主表 / 依赖表 | 可编辑 / 只读 |

## 加载要求

- 相对路径以用户选择的 `sourceRoot` 为基准。
- 表缺失时必须报告具体相对路径。
- 主键为空或重复时，该表不得进入可编辑状态。
- 只读依赖表只能用于展示、下钻和校验，不能进入 v1.0 target 输出变更集合。
