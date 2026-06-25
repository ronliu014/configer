# 技术方案

状态：Active

本文定义 `configer` v1.0 的技术方向。v1.0 是本地 Web 工具，不建设业务后端，优先保证 Excel 加载、编辑、校验、输出、备份和 changelog 的安全闭环。

## 技术目标

- 让策划通过浏览器选择 `source` 根目录和 `target` 根目录。
- `source` 根目录只读，用于加载现有配表、规则提取、baseline 和测试对比。
- `target` 根目录用于写入真实产物，输出文件按相对 `source` 根目录的路径 1:1 镜像生成。
- 公式只作为原 Excel 规则提取来源；正式输出默认写入 configer 计算后的静态结果值。
- 用模块化结构承载 `equip`，并为后续 `item`、`role`、掉落、技能等模块预留扩展。
- 把 Excel 解析、schema、diff、输出等高风险能力收敛到平台核心层。

## 技术选型

| 能力 | v1.0 选型 | 说明 |
|---|---|---|
| 工具形态 | 本地 Web 单页应用 | 通过静态服务运行，避免 `file://` 限制 |
| 文件访问 | File System Access API | 用户选择 `source` 和 `target` 两个功能根目录，目标浏览器为 Chrome / Edge |
| Excel 处理 | SheetJS | 浏览器端解析源 workbook，并按输出契约生成目标 workbook |
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
  └─ output writer / backup

modules
  ├─ equip
  ├─ item
  └─ language
```

`app shell` 只负责加载模块、展示导航和管理会话状态，不写装备业务规则。`core` 提供跨模块基础能力。`modules/<domain>` 持有本模块 schema、页面、领域服务和校验规则。

## 数据模型原则

工具内部使用稳定逻辑 key，不直接依赖 Excel 中文列名或 `Remark` 名称。Excel 原始列信息以 `srcCol`、`srcName`、sheet 名称和行号保存，用于来源追踪、diff 展示和输出定位。

每张表加载后形成三类数据：

- `sourceWorkbook`：从 `source` 根目录读取的原始 Excel 文件对象，只读保存，用于解析、对比和规则追溯。
- `schema`：字段元数据，来自 4 行表头协议和模块显式规则。
- `rows`：工具内存行数据，包含业务主键、源行号和字段值。
- `targetPlan`：目标输出文件的相对路径、sheet、字段、生成字段和值写入策略。

## 文件访问策略

v1.0 不固定读取仓库内 `source/`。运行时使用两个用户可配置的功能根目录：

- `sourceRoot`：只读输入根目录，工具按模块声明查找需要的表。
- `targetRoot`：可写目标根目录，工具按源文件相对 `sourceRoot` 的路径镜像生成输出文件。

示例：`sourceRoot/equip/equip.xlsx` 输出到 `targetRoot/equip/equip.xlsx`。如果用户选择的 `sourceRoot` 是更上层目录，则以该根目录计算相对路径。工具不得要求用户逐一配置输出文件位置。

`sourceRoot` 与 `targetRoot` 在 v1.0 必须是不同目录，且不应互相包含。若目录关系存在覆盖源表的风险，工具必须阻止输出并提示用户重新选择。

缺失表不应静默忽略，必须在加载结果中列出。

目录句柄可以保存到 IndexedDB，但每次恢复仍需处理权限失效。权限失效时回到未加载状态，让用户重新选择目录。

## Excel 输出策略

`source` 根目录中的文件不得被修改。业务模块只能提交结构化变更请求，例如“表、行主键、字段 key、新值”。`core` 根据 schema、diff 和输出契约生成目标 workbook，并写入 `targetRoot` 下的镜像相对路径。

硬性约束：

- `sourceRoot` 只读，任何阶段不得写入或覆盖源表。
- 输出文件必须保持游戏导出流程需要的 4 行表头、sheet、字段顺序和导出标记。
- 公式不作为输出运行机制；原公式列应迁移为 `generated` 规则，由 configer 写入静态结果值。
- `manual` 字段来自用户编辑，`generated` 字段来自规则计算，`ref` 和只读依赖表默认不输出变更。
- 输出到 `targetRoot` 前必须生成 diff 和 changelog 预览。
- 若目标文件已存在，覆盖前必须备份目标文件；备份失败时阻止输出。

## 错误处理

| 错误 | 处理 |
|---|---|
| 目录权限失效 | 清除当前加载状态，提示用户重新授权 |
| 表缺失 | 标记加载异常，禁用依赖该表的操作 |
| 表头协议不匹配 | 阻止该表进入可编辑状态 |
| schema 与表头不匹配 | 标记规则错误，禁止输出相关表 |
| 目标目录无权限 | 保留内存变更，提示用户重新选择 `targetRoot` |
| 输出失败 | 保留内存变更，提示失败文件、sheet、行、列 |
| 备份失败 | 阻止覆盖目标文件 |

## 取舍与风险

纯前端架构能快速交付本地工具，但依赖 Chromium 浏览器和 File System Access API。v1.0 接受该限制，因为目标是内部策划工具。后续如果要自动运行 SVN、批处理或跨浏览器支持，再引入轻量本地后端。

最大风险是输出产物不能被游戏配置流程接受，或误覆盖源表。所有实现都必须围绕“`sourceRoot` 只读、`targetRoot` 镜像输出、公式迁移为规则、输出前预览、覆盖前备份”设计。
