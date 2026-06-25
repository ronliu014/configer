# target 输出契约

状态：Active

本文定义 `equip` v1.0 生成到 `targetRoot` 的文件契约。`sourceRoot` 只读，target 文件按源文件相对路径 1:1 镜像生成。

## 输出文件

| 表 | source 相对路径 | target 相对路径 | sheet | v1.0 输出 |
|---|---|---|---|---|
| `equip` | `equip/equip.xlsx` | `equip/equip.xlsx` | `equip` | 是 |
| `item` | `item/item.xlsx` | `item/item.xlsx` | `item` | 是 |
| `language` | `language/language.xlsx` | `language/language.xlsx` | `language` | 是 |

## 不输出变更的表

装备关联表在 v1.0 只读加载，用于下钻和主键存在性校验，不输出变更。若后续版本开放关联表编辑，必须先更新本文、实现计划和测试规范。

## 输出规则

- target 相对路径必须与 source 相对路径一致。
- 输出文件必须保留 4 行表头、sheet 名称、字段顺序、导出标记和类型行。
- 原 Excel 公式不作为输出机制。
- `manual` 字段写用户编辑值。
- `generated` 字段写 configer 计算值。
- 覆盖已有 target 文件前必须备份。
- 输出成功后必须生成 changelog。

## 备份与 changelog

- 备份只针对 `targetRoot` 中将被覆盖的文件。
- 备份不得写入 `sourceRoot`。
- changelog 必须记录 source 相对路径、target 相对路径、表名、主键、字段、旧值、新值和操作类型。

## 禁止事项

- 禁止写入 `sourceRoot`。
- 禁止把 `sourceRoot` 和 `targetRoot` 设为同一目录或互相包含。
- 禁止要求用户逐一配置目标文件路径。
