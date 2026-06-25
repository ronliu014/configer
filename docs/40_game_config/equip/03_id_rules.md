# ID 与编码规则

状态：Active

本文说明 `equip` v1.0 需要实现和测试的 ID 生成规则。完整编码事实见 [equip_reference/04_ID编码规则速查.md](../../90_reference/equip_reference/04_ID编码规则速查.md)。

## 规则原则

- 生成与校验必须共用同一套规则。
- ID 生成结果必须可由输入维度稳定复现。
- 新增装备时发现主键冲突必须阻止输出。
- 原 Excel 公式只作为规则来源，target 输出写生成后的静态值。

## v1.0 必需规则

| 规则 ID | 输出字段 | 输入字段 | 目标 | 冲突处理 |
|---|---|---|---|---|
| `EQUIP_ID` | `equip.equipId` | `part`, `job`, `turn`, `branch`, `quality`, `seriesNo` | 生成装备 ID | 冲突时阻止输出 |
| `ITEM_ID` | `item.itemId` | `equipId`, 绑定状态 | 生成配套道具 ID | 冲突时阻止输出 |
| `NAME_KEY` | `equip.nameKey`, `item.nameKey` | `equipId` 或 `itemId` | 生成 language Key | 冲突时提示覆盖或复用 |
| `JOB_GROUP_ID` | `equip.jobGroupId` | `job`, `turn`, `branch`, `part` | 校验职业组 | 缺失时报 Error |
| `PROP_LIB_ID` | `equip.propLibId` | `equipId` 相关维度 | 校验固定属性库 | 缺失时报 Error |
| `RANDOM_PROP_LIB_ID` | `equip.randomPropLibId` | `equipId` 相关维度 | 校验随机词条库 | 缺失时报 Warning 或 Error，按字段规则决定 |
| `SUIT_ID` | `equip.suitId` | `job`, `turn`, `branch`, `seriesNo` | 校验套装库 | 缺失时报 Warning 或 Error，按字段规则决定 |

## EQUIP_ID 样例

| 输入 | 预期 | 说明 |
|---|---|---|
| 合法职业、部位、转数、分支、品质、套装序号 | 生成唯一装备 ID | 结果必须与参考表样例一致 |
| 输入维度为空 | 阻止生成 | 提示缺失字段 |
| 生成 ID 已存在 | 阻止新增 | 提示冲突装备 ID |

## 实现要求

- 每条规则必须有单元测试。
- 测试样例优先来自 `docs/90_reference/equip_reference/04_ID编码规则速查.md`。
- 如果参考文档与真实源表不一致，应先更新本文件和参考说明，再实现代码。
