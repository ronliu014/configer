# 40_game_config 游戏配置说明

状态：Active

本目录保存 DD 游戏配置规则说明。这里的内容来自策划设计资料、原始 Excel 配表，以及 AI/开发者对配表字段、公式、关联关系和配置流程的整理。

## 目录定位

`40_game_config/` 回答“游戏配置本身是什么”，不回答“工具代码如何实现”。它应沉淀：

- 配表字段说明、表头协议、导出规则。
- ID 编码规则、原 Excel 公式拆解、字段来源。
- 配表之间的关联关系、依赖链路、ER 图。
- 策划配置 SOP、检查清单、异常与冗余数据判定规则。
- 面向工具化的业务规则和模块分析。
- target 输出契约：输出文件、sheet、字段、生成规则和验收样例。

原 Excel 公式只作为规则提取来源。新模块必须把公式逻辑沉淀为规则说明、schema、规则代码和测试样例，不能把“保留 Excel 公式”作为 target 输出机制。

工具代码模块、页面入口、测试入口等实现说明应放在 `docs/50_modules/`。

## 模块目录

- [equip](equip/README.md)：装备配置说明，当前 MVP 的首个完整分析模块。
- [item](item/README.md)：物品配置说明预留。
- [role](role/README.md)：角色配置说明预留。
- [drop](drop/README.md)：掉落配置说明预留。

## 编写规则

- 每个配置模块必须有 `README.md`，作为该模块文档地图。
- 新模块资料应按“导读 → source 表清单 → 字段字典 → ID 与编码规则 → 关联关系 → 生成规则 → 校验规则 → 配置流程 → target 输出契约 → 验收样例”的顺序组织。
- 不确定的规则必须标明来源和验证状态，不得写成已确认事实。
- 若配置规则会影响工具实现，应在 `docs/50_modules/<module>/README.md` 建立对应链接。
- 新模块必须参考 [_template](./_template/README.md) 建立标准文档，不得只提供截图、口头说明或散乱表格。

## 必备文档

每个模块目录至少包含：

```text
docs/40_game_config/<module>/
  README.md
  01_source_tables.md
  02_field_dictionary.md
  03_id_rules.md
  04_relations.md
  05_generation_rules.md
  06_validation_rules.md
  07_workflow.md
  08_target_contract.md
  09_acceptance_cases.md
```

缺少必备文档时，该模块不能进入正式开发计划。
