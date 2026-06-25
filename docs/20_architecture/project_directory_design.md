# 项目目录设计

状态：Active

本文定义 `configer` 的目标目录结构。当前仓库仍处于文档和样例数据阶段，后续新增代码、测试和脚本时应按本文落位。

## 设计目标

- 文档分层清楚，项目级、产品级、技术级、研发级、模块级资料各有边界。
- 业务模块隔离，修改 `equip` 不应破坏 `item`、`language` 或未来模块。
- 真实 Excel 样例与生成文件分离，避免误覆盖源表。
- 平台能力沉淀到 `core` 和 `shared`，业务规则沉淀到 `modules/<domain>`。

## 目标结构

```text
configer/
  AGENTS.md
  README.md
  docs/
    00_project/
    10_product/
    20_architecture/
    30_development/
    40_game_config/
      equip/
      item/
      role/
      drop/
    50_modules/
    90_reference/
  source/
    table/default_ios/
      equip/
      item/
      language/
  src/
    app/
    core/
    shared/
    modules/
      equip/
      item/
      language/
  tests/
    core/
    modules/
  scripts/
  public/
```

## 目录职责

`docs/` 保存所有设计和规范。`docs/40_game_config/` 保存游戏配置说明、配表字段、公式规则、关联关系和配置流程；`docs/50_modules/` 保存工具实现模块入口和开发说明。

`source/` 保存真实或接近真实的输入配表样例。不要把临时导出、备份、changelog、构建产物放入此目录。

`src/app/` 保存应用外壳、路由、侧边栏、全局状态入口。它负责组合模块，不写具体业务规则。

`src/core/` 保存平台能力，例如 Excel 解析、4 行表头协议、schema 合并、对账引擎、回写器、备份、changelog。

`src/shared/` 保存跨模块复用的 UI、类型、常量和工具函数。共享代码不得依赖具体业务模块。

`src/modules/<domain>/` 保存业务模块。`equip`、`item`、`language` 各自维护 schema、页面、领域规则和模块内服务。

`tests/` 按 `src/` 镜像组织。核心能力测在 `tests/core/`，业务规则测在 `tests/modules/<domain>/`。

`scripts/` 保存启动、构建、检查、打包脚本。所有脚本应能从仓库根目录运行。

`public/` 保存静态资源和前端公开文件，不保存策划源表。

## 依赖规则

- `core` 不允许依赖 `modules`。
- `shared` 不允许依赖 `modules`。
- `modules/<domain>` 可以依赖 `core` 和 `shared`。
- 一个业务模块不得直接读取另一个业务模块内部文件；跨模块能力通过 `core` 接口或明确的公共 schema 暴露。
- Excel 写回能力只能位于 `core`，业务模块只提交结构化变更请求。

## 生成文件规则

备份、changelog、临时导出、构建产物应放入未来明确的输出目录，并默认不纳入版本库。写入真实配表前必须先生成备份和变更记录。
