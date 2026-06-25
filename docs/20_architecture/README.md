# 20_architecture 技术级文档

状态：Active

本目录保存技术方案和架构决策，回答“系统如何组织、模块如何协作、数据如何流转”。

## 当前文档

- [项目目录设计](project_directory_design.md)：仓库目标结构、目录职责、模块隔离规则。
- [technical_design.md](technical_design.md)：技术方案总稿，描述前端形态、Excel 读写、状态管理、文件访问、部署方式。
- [module_architecture.md](module_architecture.md)：模块架构，定义 `core`、`shared`、`modules`、`app` 的依赖关系。
- [data_lifecycle.md](data_lifecycle.md)：数据生命周期，定义加载、基线快照、编辑、对账、备份、回写、changelog。

## 编写原则

- 技术文档必须写清约束、取舍和失败处理。
- 涉及 Excel 回写时，必须明确公式、格式、批注、多 sheet 的保护策略。
- 架构设计优先支持模块隔离，避免修改 `equip` 影响其它业务线。
