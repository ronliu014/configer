# configer

`configer` 是面向 DD 游戏项目的策划配置工具，用于自动化生成、检查和维护复杂 Excel 配表。当前 MVP 以装备系统 `equip` 为首个业务线，后续按同一套平台能力逐步接入 `item`、`role`、掉落、技能等配置模块。

## 文档入口

- [文档中心](docs/README.md)：项目文档分层、阅读顺序、权威来源说明。
- [文档规范](docs/30_development/documentation_standard.md)：后续项目说明书、产品设计、技术方案、模块文档的写作规范。
- [项目目录设计](docs/20_architecture/project_directory_design.md)：代码、文档、测试、脚本、数据目录的目标结构与职责边界。
- [游戏配置说明](docs/40_game_config/README.md)：配表字段、规则、关联关系和配置流程的统一入口。
- [equip 工具模块入口](docs/50_modules/equip/README.md)：装备 MVP 的实现模块索引与开发依据。

## 当前资料

- `docs/40_game_config/equip/` 保存现有装备配置分析、字段规则、ER 关系、工具设计和实施指南。
- `source/table/default_ios/` 保存真实样例配表，按 `equip/`、`item/`、`language/` 等领域分组。

## 开发命令

```powershell
npm install
npm run dev
npm run build
npm test
```

- `npm run dev` 启动本地 Vite 开发服务。
- `npm run build` 执行 TypeScript 检查并生成静态产物。
- `npm test` 运行 Vitest 测试。
