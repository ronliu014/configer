# source 表清单

状态：Active

本文说明 `equip` 模块从 `sourceRoot` 读取哪些 Excel 表。`sourceRoot` 只读，用于规则分析、baseline 和测试对比，不得被工具修改。

## v1.0 可编辑表

| 表 | source 相对路径 | sheet | 主键 | 用途 | v1.0 权限 |
|---|---|---|---|---|---|
| `equip` | `equip/equip.xlsx` | `equip` | `Id` | 装备主表 | 可编辑、可输出 |
| `item` | `item/item.xlsx` | `item` | `Id` | 装备配套非绑和绑定道具 | 可编辑、可输出 |
| `language` | `language/language.xlsx` | `language` | `Key` | 装备和道具中文文案 | 可编辑、可输出 |

## v1.0 只读依赖表

| 表 | source 相对路径 | 主键 | 用途 | v1.0 权限 |
|---|---|---|---|---|
| `equip_job_group` | `equip/equip_job_group.xlsx` | `GroupID` | 职业限制组 | 只读校验 |
| `equip_proplib` | `equip/equip_proplib.xlsx` | `ID` | 固定属性库 | 只读校验 |
| `equip_random_proplib` | `equip/equip_random_proplib.xlsx` | `ID` | 随机词条库 | 只读校验 |
| `equip_special_drop` | `equip/equip_special_drop.xlsx` | `DropID` | 装备特效掉落组 | 只读校验 |
| `equip_suit` | `equip/equip_suit.xlsx` | `SuitID` | 套装库 | 只读校验 |
| `equip_rare` | `equip/equip_rare.xlsx` | `RareID` | 稀有度配置 | 只读校验 |
| `equip_skill_drop` | `equip/equip_skill_drop.xlsx` | `DropID` | 装备技能掉落 | 只读校验 |
| `equip_skill_effect` | `equip/equip_skill_effect.xlsx` | `ID` | 装备技能效果 | 只读校验 |
| `equip_special_prop` | `equip/equip_special_prop.xlsx` | `ID` | 特殊属性 | 只读校验 |

## 加载规则

- 相对路径以用户选择的 `sourceRoot` 为基准。
- 表缺失时必须报告具体相对路径。
- 主键为空或重复时，该表不得进入可编辑状态。
- 只读依赖表只能用于展示、下钻和主键存在性校验。
- v1.0 不从只读依赖表生成 target 变更。

## 参考来源

- [源表样例清单](../../90_reference/source_tables.md)
- [equip_reference/01_表结构与导出规则.md](../../90_reference/equip_reference/01_表结构与导出规则.md)
- [equip_reference/09_关联表字段清单.md](../../90_reference/equip_reference/09_关联表字段清单.md)
