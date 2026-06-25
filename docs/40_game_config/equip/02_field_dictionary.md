# 字段字典

状态：Active

本文定义 `equip` v1.0 必需字段的稳定逻辑 key、源字段和输出策略。完整字段事实见 [equip_reference/05_字段清单表.md](../../90_reference/equip_reference/05_字段清单表.md) 与 [equip_reference/09_关联表字段清单.md](../../90_reference/equip_reference/09_关联表字段清单.md)。

## 字段来源枚举

| 来源 | 含义 | target 行为 |
|---|---|---|
| `manual` | 策划手填 | 可编辑，输出静态值 |
| `generated` | configer 根据规则生成 | 不可手填，输出静态值 |
| `formula` | 原 Excel 公式 | 仅用于规则追溯，应迁移为 `generated` |
| `ref` | 关联字段 | 默认只读，按关系规则校验 |
| `imported` | 外部表导入 | 默认只读，由来源表或规则决定 |
| `hidden` | 隐藏字段 | 默认不编辑 |
| `deprecated` | 废弃字段 | 不作为新规则依据 |

## equip 主表 v1.0 字段

| 逻辑 key | 源字段 srcName | 中文名 | 类型 | 来源 | 可编辑 | 必填 | 输出策略 | 说明 |
|---|---|---|---|---|---|---|---|---|
| `equipId` | `Id` | 装备ID | int | `generated` | 否 | 是 | 输出静态值 | 由装备维度和编码规则生成 |
| `part` | `Remark*` | 部位 | int | `manual` | 是 | 是 | 输出静态值 | 装备部位维度 |
| `job` | `Remark*` | 职业 | int | `manual` | 是 | 是 | 输出静态值 | 装备职业维度 |
| `turn` | `Remark*` | 转数 | int | `manual` | 是 | 是 | 输出静态值 | 装备阶段维度 |
| `branch` | `Remark*` | 分支 | int | `manual` | 是 | 是 | 输出静态值 | 1-2 转或 3 转分支 |
| `quality` | `Remark*` | 品质 | int | `manual` | 是 | 是 | 输出静态值 | 装备品质维度 |
| `seriesNo` | `Remark*` | 第几套 | int | `manual` | 是 | 是 | 输出静态值 | 同维度内套装序号 |
| `level` | `Remark*` | 等级 | int | `manual` | 是 | 是 | 输出静态值 | 穿戴或展示等级来源 |
| `icon` | `Remark*` | 图标 | string | `manual` | 是 | 否 | 输出静态值 | 装备图标资源标识 |
| `nameKey` | `Name` | 名称 Key | string | `generated` | 否 | 是 | 输出静态值 | 关联 `language.Key` |
| `descKey` | `Desc` | 描述 Key | string | `generated` | 否 | 否 | 输出静态值 | 关联 `language.Key` |
| `itemId` | `ItemId` | 道具 ID | int | `generated` | 否 | 是 | 输出静态值 | 关联 `item.Id` |
| `jobGroupId` | `JobGroupID` | 职业限制组 | int | `generated` | 否 | 是 | 输出静态值 | 校验 `equip_job_group.GroupID` |
| `propLibId` | `PropLibID` | 固定属性库 | int | `generated` | 否 | 是 | 输出静态值 | 校验 `equip_proplib.ID` |
| `randomPropLibId` | `RandomPropLibID` | 随机词条库 | int | `generated` | 否 | 否 | 输出静态值 | 校验 `equip_random_proplib.ID` |
| `suitId` | `SuitID` | 套装 ID | int | `generated` | 否 | 否 | 输出静态值 | 校验 `equip_suit.SuitID` |

`Remark*` 表示源表中存在同名、跳号或草稿列，开发时必须用 `srcCol` + `srcName` 定位，不能把 `Remark*` 作为业务 key。

## item 与 language 字段

| 表 | 逻辑 key | 源字段 srcName | 中文名 | 来源 | 可编辑 | 输出策略 |
|---|---|---|---|---|---|---|
| `item` | `itemId` | `Id` | 道具 ID | `generated` | 否 | 输出静态值 |
| `item` | `bindItemId` | `BindItemId` | 绑定道具 ID | `generated` | 否 | 输出静态值 |
| `item` | `unBindItemId` | `UnBindItemId` | 非绑道具 ID | `generated` | 否 | 输出静态值 |
| `item` | `nameKey` | `Name` | 名称 Key | `generated` | 否 | 输出静态值 |
| `item` | `quality` | `Quality` | 道具品质 | `generated` | 否 | 输出静态值 |
| `language` | `key` | `Key` | 文案 Key | `generated` / `manual` | 是 | 输出静态值 |
| `language` | `zhs` | `Zhs` | 简体中文 | `manual` | 是 | 输出静态值 |

## 参考来源

- [equip_reference/05_字段清单表.md](../../90_reference/equip_reference/05_字段清单表.md)
- [equip_reference/13_字段配置标准（表与字段Schema）.md](../../90_reference/equip_reference/13_字段配置标准（表与字段Schema）.md)
