# 配置模块说明模板

状态：Active

本目录是 `docs/40_game_config/<module>/` 的标准模板。新增游戏配置模块时，必须复制本目录结构并替换 `<module>`、表名和字段内容。

## 使用规则

- 每个模块必须保留 01 到 09 的文档编号和职责。
- 未确认规则必须写明来源和验证状态，不能写成已确认事实。
- 原 Excel 公式只作为规则提取来源；target 输出默认写 configer 计算后的静态值。
- source 表只读，target 文件按相对 source 路径 1:1 镜像生成。
- 字段来源必须使用统一枚举：`manual`、`generated`、`formula`、`ref`、`imported`、`hidden`、`deprecated`。

## 文档清单

| 文件 | 职责 |
|---|---|
| `01_source_tables.md` | source 表、sheet、主键、权限和用途 |
| `02_field_dictionary.md` | 字段 key、源字段、类型、来源、编辑和输出策略 |
| `03_id_rules.md` | ID 编码、反解、冲突和样例 |
| `04_relations.md` | 表关系、目标主键、缺失处理和 v1.0 行为 |
| `05_generation_rules.md` | 从公式迁移出的 configer 生成规则 |
| `06_validation_rules.md` | Error / Warning / Info 检查规则 |
| `07_workflow.md` | 策划配置流程和常见失败处理 |
| `08_target_contract.md` | target 输出文件、路径、sheet、字段和备份规则 |
| `09_acceptance_cases.md` | 最小合法、冲突、缺失、生成和输出验收样例 |
