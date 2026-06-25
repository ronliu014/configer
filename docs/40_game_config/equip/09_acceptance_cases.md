# 验收样例

状态：Active

本文提供 `equip` v1.0 的最小验收样例。样例应在阶段实现时转化为自动化测试 fixture。

## 最小合法配置

| 输入 | 预期生成 | 预期校验 |
|---|---|---|
| 合法装备维度、item 文案、language 中文 | `equipId`、`itemId`、`nameKey`、关联库 ID | 通过 |

## ID 冲突样例

| 输入 | 预期结果 |
|---|---|
| 新增装备生成的 `equipId` 已存在 | 阻止输出，提示冲突装备 ID |
| 新增 item 生成的 `itemId` 已存在 | 阻止输出，提示冲突 item ID |

## 关联缺失样例

| 输入 | 预期结果 |
|---|---|
| `jobGroupId` 在 `equip_job_group` 不存在 | Error，阻止输出 |
| `propLibId` 在 `equip_proplib` 不存在 | Error，阻止输出 |
| `nameKey` 在 `language` 不存在 | Warning，引导补齐文案 |

## source / target 样例

| source 相对路径 | target 相对路径 | 预期 |
|---|---|---|
| `equip/equip.xlsx` | `equip/equip.xlsx` | 路径镜像，source 不变 |
| `item/item.xlsx` | `item/item.xlsx` | 路径镜像，source 不变 |
| `language/language.xlsx` | `language/language.xlsx` | 路径镜像，source 不变 |

## 端到端验收

1. 选择临时 `sourceRoot` 和不同的临时 `targetRoot`。
2. 加载装备相关表。
3. 新增一件装备。
4. 生成并检查 equip、item、language 变更。
5. 查看关联抽屉，存在和缺失状态都能展示。
6. 打开变更预览后取消输出，确认 target 无新增文件。
7. 再次执行输出，确认 target 按相对路径生成文件。
8. 确认 source 文件未变化。
9. 确认备份和 changelog 生成。
