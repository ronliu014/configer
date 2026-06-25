# configer 文档中心

状态：Active

本文档是 `configer` 项目的文档总入口。后续编写项目说明书、产品设计、技术方案、开发规范、模块设计时，必须先遵守这里定义的分层和阅读顺序。

## 文档分层

```text
docs/
  00_project/        项目级：背景、目标、范围、术语、路线图
  10_product/        产品级：用户场景、页面流程、功能需求、验收口径
  20_architecture/   技术级：技术方案、目录设计、模块架构、数据生命周期
  30_development/    研发级：文档规范、代码规范、测试规范、交付检查
  40_game_config/    游戏配置说明：配表字段、规则、关联关系、配置流程
  50_modules/        工具模块级：equip、item、language 等实现模块说明
  90_reference/      参考级：Excel 协议、源表清单、外部流程说明
```

## 推荐阅读顺序

1. 新成员先读 [项目说明书](00_project/project_overview.md)、[术语表](00_project/glossary.md) 和 [阶段路线图](00_project/roadmap.md)，理解项目目标与版本边界。
2. 了解策划如何使用工具时，读 [产品设计](10_product/product_design.md)、[策划操作流程](10_product/workflow.md) 和 [产品需求清单](10_product/requirements.md)。
3. 进入技术设计前，读 [项目目录设计](20_architecture/project_directory_design.md)、[技术方案](20_architecture/technical_design.md)、[模块架构](20_architecture/module_architecture.md) 和 [数据生命周期](20_architecture/data_lifecycle.md)。
4. 写任何新文档、代码或测试前，读 [文档规范](30_development/documentation_standard.md)、[代码规范](30_development/coding_standard.md)、[测试规范](30_development/testing_standard.md) 和 [交付检查清单](30_development/delivery_checklist.md)。
5. 做装备 MVP 前读 [阶段性总结 2026-06-25](00_project/stage_summary_2026_06_25.md)、[equip 工具模块入口](50_modules/equip/README.md)、[equip v1.0 任务进度表](50_modules/equip/task_board_v1.md) 和 [equip v1.0 MVP 实现计划](50_modules/equip/implementation_plan_v1.md)，再进入 [equip 配置说明](40_game_config/equip/README.md) 的详细资料。
6. 改 Excel 读取、对账、target 输出前必须读 [equip 标准配置说明](40_game_config/equip/README.md)、[Excel 配表协议](90_reference/excel_table_protocol.md) 与 [数据生命周期](20_architecture/data_lifecycle.md)。
7. 处理源表路径、样例表或外部提交流程时，读 [源表样例清单](90_reference/source_tables.md) 和 [外部流程参考](90_reference/external_workflow.md)。
8. 新增 `docs/40_game_config/` 配置模块时，必须先复制并遵守 [配置模块说明模板](40_game_config/_template/README.md)。

## 权威来源规则

当文档之间有冲突时，按以下顺序判断：

1. 当前用户明确指令。
2. `docs/30_development/` 中的规范文档。
3. `docs/00_project/`、`docs/10_product/`、`docs/20_architecture/` 中的项目级决策。
4. `docs/40_game_config/` 中的游戏配置规则说明。
5. `docs/50_modules/` 中的工具模块入口和实现摘要。
6. `docs/90_reference/` 中的参考资料。

如果配置说明与上层决策冲突，不要静默选择其一；应更新上层文档或在模块入口记录差异。
