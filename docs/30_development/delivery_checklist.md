# 交付检查清单

状态：Active

本文用于开发完成前自检。任何涉及代码、文档、配置规则或 Excel 输出的变更，都应按影响范围执行对应检查。

## 文档检查

- 新增能力是否更新了对应目录 README。
- 产品行为是否写入 `docs/10_product/`。
- 技术约束是否写入 `docs/20_architecture/`。
- 研发规则是否写入 `docs/30_development/`。
- 游戏配置规则是否写入 `docs/40_game_config/<module>/`。
- 模块边界是否写入 `docs/50_modules/<module>/README.md`。
- 文档中没有未完成占位词；检查时使用下方提交前命令。

## 代码检查

- 代码放在正确目录，不把业务逻辑写进 `app`。
- 业务模块没有直接写文件。
- `core` 没有依赖具体业务模块。
- 新增字段使用稳定逻辑 key，不使用源表 `Remark` 名作为业务 key。
- 错误返回包含可行动信息。
- demo 中的 mock 逻辑没有进入生产规则。

## Excel 输出安全检查

- `sourceRoot` 中的源表未被修改。
- `targetRoot` 中的目标文件按源文件相对路径 1:1 镜像生成。
- 覆盖 `targetRoot` 已有目标文件前生成备份。
- `manual` 字段来自用户编辑。
- `generated` 字段来自 configer 规则计算。
- 原 Excel 公式不作为输出运行机制。
- 输出集合符合版本边界：v1.0 只输出 `equip`、`item`、`language`。
- changelog 与变更预览一致。

## 测试检查

- 新增或修改核心规则时有单元测试。
- 修改加载、diff、输出时有集成测试。
- 修改 Excel 输出时有 source/target 输出安全测试。
- 修改 UI 主流程时有流程验证记录。
- 失败路径有覆盖，例如表缺失、主键悬空、备份失败。

## 版本边界检查

v1.0 不应交付以下内容：

- 关联表编辑或自动补建。
- 完整链路三态对账和反向索引增量刷新。
- 批量导入。
- AI 辅助规则编写。
- 自动 SVN 提交。

如果确实要提前实现，必须先更新项目路线图、产品需求和技术方案。

## 提交前命令

仓库有脚手架前至少执行：

```powershell
rg -n "T[D]B|T[O]DO|待[定]|以后再[写]" docs
git diff --check
git status --short --branch
```

脚手架落地后，应补充并执行项目标准命令，例如：

```powershell
npm test
npm run build
```

## 交付说明

提交或交付说明至少包含：

- 做了什么。
- 影响哪些模块。
- 验证了什么。
- 没有验证什么。
- 是否涉及 Excel 输出。
- 是否改变 v1.0 版本边界。
