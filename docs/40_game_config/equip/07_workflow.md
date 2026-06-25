# 配置流程

状态：Active

本文说明策划在 `equip` 模块中完成装备配置的 v1.0 流程。

## 准备

1. 同步或准备最新 `sourceRoot` 配置源目录。
2. 在工具中选择 `sourceRoot`。
3. 选择与 `sourceRoot` 不同且不互相包含的 `targetRoot`。
4. 工具加载 `equip`、`item`、`language` 和装备只读依赖表。
5. 加载完成后建立 baseline。

## 新增装备

1. 填写装备手填维度：部位、职业、转数、分支、品质、套装序号、等级、图标等。
2. 工具生成装备 ID、item ID、language Key 和关联库 ID。
3. 工具检查装备 ID 和 item ID 是否冲突。
4. 工具检查关联表主键是否存在。
5. 策划补充或修改 item 与 language 文案。
6. 查看变更预览。
7. 输出到 `targetRoot`。

## 编辑装备

1. 从装备列表选择已有装备。
2. 修改允许编辑的 `manual` 字段。
3. 工具重新计算受影响的 `generated` 字段。
4. 工具更新 diff 和校验结果。
5. 预览变更后输出到 `targetRoot`。

## 删除装备

1. 从列表选择装备并触发删除。
2. 工具展示待删除的 equip、item、language 影响范围。
3. 用户确认后仅修改内存数据。
4. 输出前仍可取消。

## 常见失败

| 失败 | 原因 | 处理 |
|---|---|---|
| 无法加载表 | source 相对路径缺失 | 检查 sourceRoot 选择是否正确 |
| ID 冲突 | 生成 ID 已存在 | 修改输入维度或序号 |
| 关联缺失 | 目标表没有对应主键 | 修正输入维度或补齐源配置 |
| 文案缺失 | language 中没有 Key | 在工具内补齐 language |
| 无法输出 | targetRoot 与 sourceRoot 冲突 | 重新选择 targetRoot |

## 参考来源

- [equip_reference/10_装备配置流程.md](../../90_reference/equip_reference/10_装备配置流程.md)
- [equip_reference/12_装备配置工具设计规范.md](../../90_reference/equip_reference/12_装备配置工具设计规范.md)
