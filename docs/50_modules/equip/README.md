# equip 模块文档入口

状态：Active

`equip` 是 `configer` 的首个 MVP 业务线，目标是把装备配置从手工 Excel 操作升级为可视化、可校验、可安全输出的本地配置工具。

## 当前范围

- source 样例主表：`source/table/default_ios/equip/equip.xlsx`
- source 样例公共表：`source/table/default_ios/item/`、`source/table/default_ios/language/`
- 一级关联表：装备职业组、固定属性库、随机词条库、特效库、套装库、稀有度、装备技能掉落等。
- MVP target 输出范围：`equip`、`item`、`language` 三类表。
- 运行时 `sourceRoot` 和 `targetRoot` 均由用户选择；仓库内 `source/` 只作为样例资源目录。

## 实现计划

- [implementation_plan_v1.md](implementation_plan_v1.md)：装备配置 v1.0 MVP 的开发前任务拆解、目标目录、阶段顺序和验收标准。
- [task_board_v1.md](task_board_v1.md)：装备配置 v1.0 MVP 的阶段任务进度表，用于中断后恢复和阶段完成记录。

## 必读顺序

1. [task_board_v1.md](task_board_v1.md)：当前阶段、完成记录、恢复指引。
2. [implementation_plan_v1.md](implementation_plan_v1.md)：开发前任务拆解、阶段顺序、验收标准。
3. `docs/40_game_config/equip/README.md`：当前有效的标准化装备配置说明入口。
4. `docs/40_game_config/equip/01_source_tables.md` 到 `09_acceptance_cases.md`：source 表、字段、规则、校验、流程和 target 输出契约。
5. `docs/90_reference/equip_reference/04_ID编码规则速查.md`：ID 生成和对账事实依据。
6. `docs/90_reference/equip_reference/05_字段清单表.md` 与 `docs/90_reference/equip_reference/09_关联表字段清单.md`：字段事实依据。
7. `docs/90_reference/equip_reference/12_装备配置工具设计规范.md`：页面、状态、交互和历史设计参考。
8. `docs/90_reference/equip_reference/14_工具化设计评审意见.md`：已确认的风险和修正意见。
9. `docs/90_reference/equip_reference/demo/装备配置工具.html`：产品参考样例页面。

## 开发红线

- `sourceRoot` 只读，不得修改源表。
- target 文件按源文件相对 `sourceRoot` 的路径 1:1 镜像生成。
- 原 Excel 公式只作为规则提取来源；target 输出默认写 configer 计算后的静态值。
- 生成与对账必须共用同一套编码规则。
- 列表只读预计算状态，不实时跑全链路对账。
- 大表必须分页或懒加载，查找使用 `Map` 或 `Set`。
- demo 只作为交互参考，业务逻辑以文档规则为准。
