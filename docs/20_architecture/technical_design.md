# 技术方案

状态：Active

本文定义 `configer` v1.0 的技术方向。v1.0 是本地 Web 工具，不建设业务后端，优先保证 Excel 加载、编辑、校验、备份、回写和 changelog 的安全闭环。

## 技术目标

- 让策划通过浏览器选择本地配表目录并编辑配置。
- 保留现有 Excel 工作流，不破坏公式、格式、批注和多 sheet 内容。
- 用模块化结构承载 `equip`，并为后续 `item`、`role`、掉落、技能等模块预留扩展。
- 把 Excel 解析、schema、diff、回写等高风险能力收敛到平台核心层。

## 技术选型

| 能力 | v1.0 选型 | 说明 |
|---|---|---|
| 工具形态 | 本地 Web 单页应用 | 通过静态服务运行，避免 `file://` 限制 |
| 文件访问 | File System Access API | 用户选择配表目录，支持本地读写，目标浏览器为 Chrome / Edge |
| Excel 处理 | SheetJS | 浏览器端解析 workbook 和逐单元格写回 |
| 本地状态 | 内存 + IndexedDB | 内存保存会话数据，IndexedDB 保存目录句柄和偏好 |
| 业务后端 | v1.0 不引入 | 自动 SVN 提交等能力放到 v2.0 评估 |

## 架构概览

```text
app shell
  ├─ module registry
  ├─ route / navigation
  └─ session state

core
  ├─ file access
  ├─ excel workbook parser
  ├─ schema merger
  ├─ validation engine
  ├─ diff / changelog
  └─ write-back / backup

modules
  ├─ equip
  ├─ item
  └─ language
```

`app shell` 只负责加载模块、展示导航和管理会话状态，不写装备业务规则。`core` 提供跨模块基础能力。`modules/<domain>` 持有本模块 schema、页面、领域服务和校验规则。

## 数据模型原则

工具内部使用稳定逻辑 key，不直接依赖 Excel 中文列名或 `Remark` 名称。Excel 原始列信息以 `srcCol`、`srcName`、sheet 名称和行号保存，用于回写定位。

每张表加载后形成三类数据：

- `workbook`：原始 Excel 文件对象，回写时保留公式、格式、批注和其它 sheet。
- `schema`：字段元数据，来自 4 行表头协议和模块显式规则。
- `rows`：工具内存行数据，包含业务主键、源行号和字段值。

## 文件访问策略

v1.0 不固定读取仓库内 `source/`。用户在首屏选择配表根目录，工具按模块声明查找需要的表。缺失表不应静默忽略，必须在加载结果中列出。

目录句柄可以保存到 IndexedDB，但每次恢复仍需处理权限失效。权限失效时回到未加载状态，让用户重新选择目录。

## Excel 回写策略

回写必须逐单元格修改原 workbook，不允许整表重建。业务模块只能提交结构化变更请求，例如“表、行主键、字段 key、新值”。`core` 根据 schema 判断字段是否允许写回，并映射到具体 sheet、行、列。

硬性约束：

- 只写 `manual` 手填字段。
- 公式列、自动字段、导入字段、只读关联字段不得写成静态值。
- 新增行只填手填字段，公式列应沿用原表公式策略。
- 写回前必须备份原文件。
- 写回后必须生成 changelog。

## 错误处理

| 错误 | 处理 |
|---|---|
| 目录权限失效 | 清除当前加载状态，提示用户重新授权 |
| 表缺失 | 标记加载异常，禁用依赖该表的操作 |
| 表头协议不匹配 | 阻止该表进入可编辑状态 |
| schema 与表头不匹配 | 标记规则错误，禁止写回相关字段 |
| 写回失败 | 保留内存变更，提示失败文件、sheet、行、列 |
| 备份失败 | 阻止写回 |

## 取舍与风险

纯前端架构能快速交付本地工具，但依赖 Chromium 浏览器和 File System Access API。v1.0 接受该限制，因为目标是内部策划工具。后续如果要自动运行 SVN、批处理或跨浏览器支持，再引入轻量本地后端。

最大风险是 Excel 写回破坏源表。所有实现都必须围绕“原 workbook、逐单元格、只写手填字段、先备份后写回”设计。
