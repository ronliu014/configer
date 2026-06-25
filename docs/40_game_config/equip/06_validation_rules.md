# 校验规则

状态：Active

本文列出 `equip` v1.0 必须执行的检查规则。规则必须可测试，错误提示必须能帮助策划定位问题。

## 规则级别

| 级别 | 行为 |
|---|---|
| `Error` | 阻止 target 输出 |
| `Warning` | 允许输出，但必须提示并进入 changelog |
| `Info` | 仅提示 |

## v1.0 规则清单

| 规则 ID | 级别 | 检查对象 | 条件 | 提示 | 是否阻止输出 |
|---|---|---|---|---|---|
| `EQUIP_ID_DUPLICATE` | `Error` | `equip.equipId` | 生成 ID 已存在 | 装备 ID 已存在 | 是 |
| `EQUIP_REQUIRED_EMPTY` | `Error` | `equip` 手填维度 | 必填字段为空 | 装备必填维度缺失 | 是 |
| `EQUIP_ITEM_MISSING` | `Error` | `equip.itemId` | `item.Id` 不存在 | 装备关联道具不存在 | 是 |
| `EQUIP_JOB_GROUP_MISSING` | `Error` | `equip.jobGroupId` | `equip_job_group.GroupID` 不存在 | 职业限制组不存在 | 是 |
| `EQUIP_PROP_LIB_MISSING` | `Error` | `equip.propLibId` | `equip_proplib.ID` 不存在 | 固定属性库不存在 | 是 |
| `EQUIP_LANGUAGE_MISSING` | `Warning` | `equip.nameKey`, `descKey` | `language.Key` 不存在 | 装备文案缺失 | 否 |
| `ITEM_PAIR_BROKEN` | `Error` | `item` | 绑定/非绑互指不完整 | 道具绑定关系不完整 | 是 |
| `TARGET_PATH_CONFLICT` | `Error` | source/target 目录 | 目录相同或互相包含 | source 与 target 目录冲突 | 是 |

## v1.0 不做

- 不自动补建关联表。
- 不做完整链路三态对账。
- 不做反向索引增量刷新。
- 不自动提交 SVN。

## 参考来源

- [equip_reference/14_工具化设计评审意见.md](../../90_reference/equip_reference/14_工具化设计评审意见.md)
- [equip_reference/15_工具开发实施指南.md](../../90_reference/equip_reference/15_工具开发实施指南.md)
