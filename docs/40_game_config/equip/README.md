# equip 装备配置说明

状态：Active

本文是装备配置模块的标准化文档入口。旧版逆向分析、公式拆解、demo 和评审资料已保留在 [equip_reference](../../90_reference/equip_reference/README.md)，本目录只沉淀当前开发可直接使用的 source 表、字段、规则、校验和 target 输出契约。

## 模块定位

`equip` 是 `configer` v1.0 首个业务配置模块，目标是让策划在工具中完成装备、配套 item 和 language 文案的新增、编辑、校验和 target 输出。

## 当前边界

- source 根目录只读，用于加载原始装备配置表、提取规则、建立 baseline 和测试对比。
- target 根目录用于输出真实产物，文件按 source 相对路径 1:1 镜像生成。
- v1.0 可编辑并输出：`equip`、`item`、`language`。
- v1.0 只读校验：装备关联库表。
- 原 Excel 公式只作为规则提取来源；target 输出默认写 configer 计算后的静态值。

## 必读顺序

1. [01_source_tables.md](01_source_tables.md)：source 表、sheet、主键和权限。
2. [02_field_dictionary.md](02_field_dictionary.md)：v1.0 字段来源、编辑和输出策略。
3. [03_id_rules.md](03_id_rules.md)：装备 ID 和关联 ID 生成规则。
4. [04_relations.md](04_relations.md)：装备、item、language 和关联表关系。
5. [05_generation_rules.md](05_generation_rules.md)：从原公式迁移出的生成规则。
6. [06_validation_rules.md](06_validation_rules.md)：阻止输出和提示规则。
7. [07_workflow.md](07_workflow.md)：策划操作流程。
8. [08_target_contract.md](08_target_contract.md)：target 输出文件契约。
9. [09_acceptance_cases.md](09_acceptance_cases.md)：验收样例。

## 参考资料

- [equip_reference/04_ID编码规则速查.md](../../90_reference/equip_reference/04_ID编码规则速查.md)：ID 编码事实依据。
- [equip_reference/05_字段清单表.md](../../90_reference/equip_reference/05_字段清单表.md)：字段事实依据。
- [equip_reference/09_关联表字段清单.md](../../90_reference/equip_reference/09_关联表字段清单.md)：关联表字段事实依据。
- [equip_reference/12_装备配置工具设计规范.md](../../90_reference/equip_reference/12_装备配置工具设计规范.md)：UI 和交互参考。
- [equip_reference/demo/装备配置工具.html](../../90_reference/equip_reference/demo/装备配置工具.html)：产品参考样例页面。

## 开发红线

- 不修改 `sourceRoot` 中的源表。
- 不要求用户逐一配置 target 文件路径。
- target 文件必须按 source 相对路径镜像生成。
- 原 Excel 公式不得作为 target 输出运行机制。
- 关联表在 v1.0 只读，不进入输出变更集合。
