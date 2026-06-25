# equip v1.0 任务进度表

状态：Active

本文是 `equip` 装备配置 v1.0 MVP 的持续进度记录。后续开发无论是否中断，都应先阅读本文，再继续执行 [implementation_plan_v1.md](implementation_plan_v1.md)。

## 使用规则

- 每完成一个阶段，必须更新本文。
- 每次更新必须记录提交号、验证命令、结果摘要和遗留风险。
- 如果阶段被阻塞，状态标记为 `Blocked`，并写清阻塞条件和需要谁处理。
- 如果阶段范围变化，先更新 [implementation_plan_v1.md](implementation_plan_v1.md)，再更新本文。
- `source/` 不纳入提交；若阶段使用真实样例，只记录使用路径和验证结论。

## 状态说明

| 状态 | 含义 |
|---|---|
| `Not Started` | 尚未开始 |
| `In Progress` | 正在执行 |
| `Blocked` | 被外部条件或技术验证阻塞 |
| `Done` | 已完成并提交 |
| `Skipped` | 经文档确认后跳过 |

## 当前总览

| 项 | 当前值 |
|---|---|
| 当前阶段 | 阶段 0：脚手架与开发命令 |
| 当前状态 | `Not Started` |
| 最近完成阶段提交 | `17ffaec Add equip MVP implementation plan` |
| 下一步 | 创建 Vite + React + TypeScript 脚手架，并建立 `npm run dev`、`npm run build`、`npm test` |
| 当前阻塞 | 无 |
| 注意事项 | 阶段 1 Excel 写回技术验证不得跳过 |

## 阶段进度

| 阶段 | 名称 | 状态 | 目标提交 | 验证证据 | 备注 |
|---|---|---|---|---|---|
| 0 | 脚手架与开发命令 | `Not Started` | `Scaffold local web app` | 未执行 | 先建立 Vite + React + TypeScript、Vitest、基础目录 |
| 1 | Excel 写回技术验证 | `Not Started` | `Verify Excel writeback safety` | 未执行 | 必须验证公式、格式、批注、多 sheet 保留；失败则先调整技术方案 |
| 2 | 核心类型与 4 行表头解析 | `Not Started` | `Add Excel header parser` | 未执行 | 解析 4 行表头，记录 `srcCol` / `srcName` |
| 3 | schema registry 与模块注册 | `Not Started` | `Add schema and module registry` | 未执行 | 注册 `equip`、`item`、`language`，关联表只读 |
| 4 | table store、baseline 与索引 | `Not Started` | `Add table store and baseline` | 未执行 | baseline 不得被编辑污染 |
| 5 | 配表目录加载 | `Not Started` | `Add local table loading session` | 未执行 | 不硬编码 `source/` 路径 |
| 6 | equip / item / language 最小 schema | `Not Started` | `Add v1 equip schemas` | 未执行 | 字段使用稳定逻辑 key |
| 7 | 配置中心外壳与导航 | `Not Started` | `Add configuration center shell` | 未执行 | 参考产品样例页面，不复制 mock 逻辑 |
| 8 | 装备列表 | `Not Started` | `Add equip list page` | 未执行 | 搜索、筛选、分页，大表查找用 `Map` / `Set` |
| 9 | 装备新增、编辑、删除 | `Not Started` | `Add equip edit workflow` | 未执行 | 新增撞 ID 拦截，编辑更新原行 |
| 10 | item 与 language 维护 | `Not Started` | `Add item and language editing` | 未执行 | 支持配套 item 和文案编辑 |
| 11 | 只读关联抽屉与存在性校验 | `Not Started` | `Add read-only relation drawer` | 未执行 | 关联表只读，不补建 |
| 12 | diff、变更预览和 changelog | `Not Started` | `Add diff and changelog generation` | 未执行 | 预览和 changelog 使用同一份 diff |
| 13 | 备份与写回 | `Not Started` | `Add safe Excel writeback` | 未执行 | v1.0 只写 `equip`、`item`、`language` |
| 14 | 端到端验收 | `Not Started` | `Validate equip v1 MVP workflow` | 未执行 | `npm test`、`npm run build` 和写回安全验证必须通过 |

## 阶段记录模板

完成或阻塞任一阶段时，在下方追加记录。

```markdown
### 阶段 N：阶段名称

- 状态：Done | Blocked
- 提交：`<commit hash> <commit title>`
- 时间：YYYY-MM-DD HH:mm
- 变更范围：
  - `<path>`
- 验证：
  - `<command>`：通过 / 失败，摘要
- 结果：
  - 完成了什么
- 遗留风险：
  - 无 / 风险说明
- 下一步：
  - 阶段 N+1：阶段名称
```

## 阶段记录

### 规划阶段：阶段性总结与实现计划

- 状态：Done
- 提交：`17ffaec Add equip MVP implementation plan`
- 时间：2026-06-25
- 变更范围：
  - `docs/00_project/stage_summary_2026_06_25.md`
  - `docs/50_modules/equip/implementation_plan_v1.md`
  - `docs/50_modules/equip/README.md`
  - `docs/README.md`
- 验证：
  - `rg -n "TB[D]|TO[D]O|待[定]|以后再[写]|implement late[r]|fill in detail[s]" docs`：无命中
  - `git diff --check`：通过
- 结果：
  - 阶段性总结和 MVP 实现计划已建立。
  - 明确阶段 1 Excel 写回技术验证不得跳过。
- 遗留风险：
  - 尚未开始代码实现。
  - 尚未验证 SheetJS 是否满足写回保护要求。
- 下一步：
  - 阶段 0：脚手架与开发命令。

## 恢复工作指引

上下文丢失或中断后，按以下顺序恢复：

1. 执行 `git status --short --branch`，确认当前分支和未提交改动。
2. 阅读本文的“当前总览”和“阶段进度”。
3. 阅读最近一条“阶段记录”。
4. 打开 [implementation_plan_v1.md](implementation_plan_v1.md)，进入下一阶段。
5. 执行阶段前检查：
   - 当前阶段不是 `Done`。
   - 没有未确认的用户改动。
   - `source/` 不纳入提交。
6. 完成阶段后更新本文、运行验证命令、提交并推送。
