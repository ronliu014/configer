# 90_reference 参考级文档

状态：Active

本目录保存跨项目或跨模块复用的参考资料。参考文档用于支撑实现，但通常不是产品需求本身。

## 计划文档

- `excel_table_protocol.md`：Excel 4 行表头协议、`A/N/S/C` 导出标记、公式列保护规则。
- `source_tables.md`：`source/table/default_ios/` 下样例表清单和用途。
- `external_workflow.md`：SVN、ExcelMerge、excel-batch-commit 等外部流程说明。

## 编写原则

- 参考文档应描述事实和协议，不写临时产品决策。
- 如果参考资料影响开发红线，应在 `docs/30_development/` 或 `docs/20_architecture/` 中建立规范性链接。
