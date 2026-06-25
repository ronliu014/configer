# 关联关系

状态：Active

本文说明 `equip` v1.0 的表关系。v1.0 默认只做主键存在性校验，不自动补建关联表。

## 关系清单

| 来源表 | 来源字段 | 目标表 | 目标字段 | 关系类型 | 缺失级别 | v1.0 行为 |
|---|---|---|---|---|---|---|
| `equip` | `itemId` | `item` | `Id` | `many-to-one` | `Error` | 阻止输出 |
| `equip` | `nameKey` | `language` | `Key` | `many-to-one` | `Warning` | 允许补文案后输出 |
| `equip` | `descKey` | `language` | `Key` | `many-to-one` | `Warning` | 允许补文案后输出 |
| `equip` | `jobGroupId` | `equip_job_group` | `GroupID` | `many-to-one` | `Error` | 阻止输出 |
| `equip` | `propLibId` | `equip_proplib` | `ID` | `many-to-one` | `Error` | 阻止输出 |
| `equip` | `randomPropLibId` | `equip_random_proplib` | `ID` | `many-to-one` | `Warning` | 提示后按模块规则决定 |
| `equip` | `suitId` | `equip_suit` | `SuitID` | `many-to-one` | `Warning` | 提示后按模块规则决定 |
| `equip` | `specialDropId` | `equip_special_drop` | `DropID` | `many-to-one` | `Warning` | 只读下钻 |
| `equip` | `skillDropId` | `equip_skill_drop` | `DropID` | `many-to-one` | `Warning` | 只读下钻 |

## 缺失处理

- `Error`：阻止 target 输出。
- `Warning`：允许输出，但必须提示并进入 changelog。
- `Info`：仅提示，不影响输出。

## 只读下钻

关联存在时，工具可以展示目标条目和只读字段。关联缺失时，提示必须包含来源表、来源字段、目标表和目标主键。v1.0 不提供关联表保存、删除或补建按钮。

## 参考来源

- [equip_reference/06_关联配置表说明.md](../../90_reference/equip_reference/06_关联配置表说明.md)
- [equip_reference/08_ER关系图.md](../../90_reference/equip_reference/08_ER关系图.md)
- [equip_reference/09_关联表字段清单.md](../../90_reference/equip_reference/09_关联表字段清单.md)
