# 阶段性总结 2026-06-25

状态：Active

本文总结 `configer` 在进入 MVP 实现计划前已经完成的项目规范化工作，以及下一阶段的工作入口。

> 后续更新：旧版 equip 逆向分析、公式拆解、demo 和评审资料已迁移到 `docs/90_reference/equip_reference/`；当前有效的标准化装备配置说明位于 `docs/40_game_config/equip/`。v1.0 当前采用 `sourceRoot` 只读、`targetRoot` 镜像输出的方案，不再以原地写回源表或保留 Excel 公式作为目标。

## 已完成事项

### 1. 仓库贡献指南

已创建 `AGENTS.md`，明确仓库结构、文档入口、MVP 范围、测试重点、提交要求和 `source/` 资源目录注意事项。

### 2. 文档分层

已建立并推送以下文档层级：

```text
docs/
  00_project/        项目级：背景、目标、术语、路线图
  10_product/        产品级：产品设计、操作流程、需求清单
  20_architecture/   技术级：目录设计、技术方案、模块架构、数据生命周期
  30_development/    研发级：文档规范、代码规范、测试规范、交付清单
  40_game_config/    游戏配置说明：字段、规则、关联关系、配置流程
  50_modules/        工具模块入口：equip 等实现模块
  90_reference/      参考资料：Excel 协议、源表清单、外部流程
```

### 3. equip 配置知识库整理

原 `docs/equip/` 内容已迁移到 `docs/40_game_config/equip/`，作为装备业务配置规则和关联关系的权威知识库。`docs/40_game_config/` 已预留 `item`、`role`、`drop` 等模块入口，便于后续统一管理。

### 4. 产品与技术边界

已经确认 `configer` v1.0 是本地 Web 工具，MVP 聚焦装备配置闭环。

v1.0 范围：

- 加载用户选择的配表根目录。
- 编辑 `equip`、`item`、`language`。
- 只读加载装备关联表。
- 做关联主键存在性校验。
- 写回 `equip`、`item`、`language`。
- 写回前备份，写回后生成 changelog。

v1.0 不做：

- 关联表编辑或补建。
- 完整链路三态对账和反向索引。
- 批量导入。
- AI 辅助规则编写。
- 自动 SVN 提交。

### 5. 产品样例页面定位

`docs/90_reference/equip_reference/demo/装备配置工具.html` 已明确为产品同学提供的 UI / 交互参考样例。后续实现应参考其配置中心侧栏、装备列表、两阶段新增、详情双 Tab、关联抽屉、加载配表、输出预览和 changelog 展示。

该页面中的静态 mock 数据和简化计算逻辑不作为业务规则。真实规则以 `docs/40_game_config/equip/` 下的配置说明为准。

### 6. source 目录处理

`source/` 是本地资源目录认知，用于观察真实或接近真实的配表样例。该目录当前不纳入 Git 追踪，也不应作为工具运行的固定依赖。真实使用时由用户选择配表根目录。

## 已推送提交

- `dbc1524 Document project structure guidelines`
- `bd8c034 Reorganize game config documentation`
- `0d03997 Add planning and development docs`
- `3224626 Add reference workflow docs`

## 当前风险

| 风险 | 说明 | 下一步处理 |
|---|---|---|
| Excel 写回安全 | 必须确认所选库能保留公式、格式、批注、多 sheet | 在实现计划第一阶段做技术验证 |
| 字段 key 稳定性 | 源表存在 `Remark*` 撞名和业务含义不稳定问题 | schema 使用稳定逻辑 key，源名只做映射 |
| v1.0 范围膨胀 | 关联补建、完整对账、批量导入都容易提前混入 | 实现计划中按版本边界拆任务 |
| demo 误用 | demo 有静态 mock 和简化编码函数 | 研发规范要求不得从 demo 反推业务规则 |

## 下一阶段

进入 MVP 开发前的实现计划阶段。当前入口文档为：

- `docs/50_modules/equip/implementation_plan_v1.md`

该计划用于指导后续脚手架、核心 Excel 能力、装备页面、关联抽屉、diff/changelog 和写回安全验证的开发顺序。
