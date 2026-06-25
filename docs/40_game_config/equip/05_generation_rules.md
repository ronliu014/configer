# 生成规则

状态：Active

本文记录从原 Excel 公式和策划配置流程迁移出的 configer 生成规则。target 输出默认写生成后的静态值，不依赖 Excel 公式继续计算。

## 规则清单

| 规则 ID | 输出字段 | 输入字段 | 来源 | 是否阻止输出 |
|---|---|---|---|---|
| `EQUIP_ID` | `equip.equipId` | 装备维度字段 | 原 Excel 公式 / 编码规则 | 是 |
| `ITEM_PAIR` | `item.itemId`, `bindItemId`, `unBindItemId` | `equipId` | 策划道具规则 | 是 |
| `LANGUAGE_KEYS` | `equip.nameKey`, `equip.descKey`, `item.nameKey` | `equipId`, `itemId` | 原 Excel 公式 / 文案规则 | 否 |
| `JOB_GROUP_ID` | `equip.jobGroupId` | 职业、转数、分支、部位 | 原 Excel 公式 | 是 |
| `PROP_LIBRARY_IDS` | `equip.propLibId`, `randomPropLibId` | 装备维度字段 | 原 Excel 公式 | 按字段规则 |

## 规则要求

- 规则实现必须引用稳定逻辑 key。
- 原 Excel 公式只记录为追溯来源。
- 生成结果必须进入 diff、变更预览和 changelog。
- 输入缺失时必须返回结构化错误，不能生成半成品 ID。

## 规则详情模板

### `EQUIP_ID`：装备 ID 生成

- 输出字段：`equip.equipId`
- 来源类型：`generated`
- 输入字段：`part`, `job`, `turn`, `branch`, `quality`, `seriesNo`
- 原 Excel 公式：见 [equip_reference/04_ID编码规则速查.md](../../90_reference/equip_reference/04_ID编码规则速查.md)
- 规则步骤：
  1. 校验所有输入维度存在。
  2. 按编码规则拼接装备 ID。
  3. 检查 `equip.equipId` 是否冲突。
  4. 输出静态 ID 值。
- 异常处理：
  - 输入缺失时报 `Error`。
  - ID 冲突时报 `Error`。

## 参考来源

- [equip_reference/02_字段字典与公式拆解.md](../../90_reference/equip_reference/02_字段字典与公式拆解.md)
- [equip_reference/03_Sheet4参照数据字典.md](../../90_reference/equip_reference/03_Sheet4参照数据字典.md)
- [equip_reference/04_ID编码规则速查.md](../../90_reference/equip_reference/04_ID编码规则速查.md)
