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

1. 新成员先读 [项目目录设计](20_architecture/project_directory_design.md)，理解仓库边界。
2. 写任何新文档前先读 [文档规范](30_development/documentation_standard.md)。
3. 做装备 MVP 前读 [equip 工具模块入口](50_modules/equip/README.md)，再进入 [equip 配置说明](40_game_config/equip/README.md) 的详细资料。
4. 改 Excel 读写、对账、回写前必须读 `docs/40_game_config/equip/12_装备配置工具设计规范.md` 与 `docs/40_game_config/equip/15_工具开发实施指南.md`。

## 权威来源规则

当文档之间有冲突时，按以下顺序判断：

1. 当前用户明确指令。
2. `docs/30_development/` 中的规范文档。
3. `docs/00_project/`、`docs/10_product/`、`docs/20_architecture/` 中的项目级决策。
4. `docs/40_game_config/` 中的游戏配置规则说明。
5. `docs/50_modules/` 中的工具模块入口和实现摘要。
6. `docs/90_reference/` 中的参考资料。

如果配置说明与上层决策冲突，不要静默选择其一；应更新上层文档或在模块入口记录差异。
