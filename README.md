# configer

`configer` 是面向 DD 游戏项目的策划配置工具，用于自动化生成、检查和维护复杂 Excel 配表。当前 MVP 以装备系统 `equip` 为首个业务线，后续按同一套平台能力逐步接入 `item`、`role`、掉落、技能等配置模块。

## 文档入口

- [文档中心](docs/README.md)：项目文档分层、阅读顺序、权威来源说明。
- [文档规范](docs/30_development/documentation_standard.md)：后续项目说明书、产品设计、技术方案、模块文档的写作规范。
- [项目目录设计](docs/20_architecture/project_directory_design.md)：代码、文档、测试、脚本、数据目录的目标结构与职责边界。
- [equip 模块入口](docs/40_modules/equip/README.md)：装备 MVP 的文档索引与开发依据。

## 当前资料

- `docs/equip/doc/` 保存现有装备配置分析、字段规则、ER 关系、工具设计和实施指南。
- `source/table/default_ios/` 保存真实样例配表，按 `equip/`、`item/`、`language/` 等领域分组。
