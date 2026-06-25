# equip 模块文档入口

状态：Active

`equip` 是 `configer` 的首个 MVP 业务线，目标是把装备配置从手工 Excel 操作升级为可视化、可校验、可安全写回的本地配置工具。

## 当前范围

- 主表：`source/table/default_ios/equip/equip.xlsx`
- 配套公共表：`source/table/default_ios/item/`、`source/table/default_ios/language/`
- 一级关联表：装备职业组、固定属性库、随机词条库、特效库、套装库、稀有度、装备技能掉落等。
- MVP 写回范围：`equip`、`item`、`language` 三类表。

## 实现计划

- [implementation_plan_v1.md](implementation_plan_v1.md)：装备配置 v1.0 MVP 的开发前任务拆解、目标目录、阶段顺序和验收标准。

## 必读顺序

1. [implementation_plan_v1.md](implementation_plan_v1.md)：开发前任务拆解、阶段顺序、验收标准。
2. `docs/40_game_config/equip/15_工具开发实施指南.md`：开发蓝图、版本边界、红线。
3. `docs/40_game_config/equip/12_装备配置工具设计规范.md`：页面、状态、加载、回写、变更记录。
4. `docs/40_game_config/equip/13_字段配置标准（表与字段Schema）.md`：schema、字段来源、关联下钻。
5. `docs/40_game_config/equip/04_ID编码规则速查.md`：ID 生成和对账规则。
6. `docs/40_game_config/equip/05_字段清单表.md` 与 `docs/40_game_config/equip/09_关联表字段清单.md`：字段事实依据。
7. `docs/40_game_config/equip/10_装备配置流程.md`：策划配置流程。
8. `docs/40_game_config/equip/14_工具化设计评审意见.md`：已确认的风险和修正意见。

## 开发红线

- 回写只允许修改手填字段，公式列不得写成静态值。
- 生成与对账必须共用同一套编码规则。
- 列表只读预计算状态，不实时跑全链路对账。
- 大表必须分页或懒加载，查找使用 `Map` 或 `Set`。
- demo 只作为交互参考，业务逻辑以文档规则为准。
