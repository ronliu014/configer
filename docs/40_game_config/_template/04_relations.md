# 关联关系

状态：Active

本文说明本模块与其它表的引用关系。v1.0 默认只做主键存在性校验，不自动补建关联表。

## 关系清单

| 来源表 | 来源字段 | 目标表 | 目标字段 | 关系类型 | 缺失级别 | v1.0 行为 |
|---|---|---|---|---|---|---|
| `<sourceTable>` | `<fieldKey>` | `<targetTable>` | `<targetKey>` | `many-to-one` | `Error` | 阻止输出 |

## 关系类型

- `one-to-one`
- `one-to-many`
- `many-to-one`
- `many-to-many`
- `lookup`
- `derived`

## 缺失处理

- `Error`：阻止输出。
- `Warning`：允许输出，但必须提示。
- `Info`：仅提示。
