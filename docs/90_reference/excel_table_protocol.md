# Excel 配表协议

状态：Active

本文记录 `configer` 读取 DD 策划配表和生成目标 Excel 时必须遵守的结构协议。具体字段含义仍以各模块的游戏配置说明为准。

## 4 行表头协议

配表工作表前 4 行是元信息，第 5 行开始才是业务数据。

| 行号 | 含义 | 工具用途 |
|---|---|---|
| 第 1 行 | 字段中文名 | UI 显示、变更预览、changelog |
| 第 2 行 | 导出标记 | 判断字段导出去向和部分字段性质 |
| 第 3 行 | 数据类型 | 初步类型解析和输入校验 |
| 第 4 行 | 字段英文 key | 源表字段名，保存为 `srcName` |

工具解析时必须同时记录 sheet 名、列坐标、源字段名和源行号。业务逻辑不得直接依赖 `Remark10` 这类源字段名，应使用模块 schema 中定义的稳定逻辑 key。

## 导出标记

装备表中已确认的标记含义如下：

| 标记 | 含义 | 说明 |
|---|---|---|
| `A` | 双端导出 | 客户端和服务端都使用 |
| `S` | 仅服务端 | 服务端配置字段 |
| `C` | 仅客户端 | 客户端展示字段 |
| `N` | 不导出 | Excel 内部草稿列或推导列 |

不同模块如有差异，必须在 `docs/40_game_config/<module>/` 中补充说明。工具不得只根据导出标记判断是否可写，是否可写必须以 schema 的字段来源和 `editable` 规则为准。

## 字段来源与输出

| 来源 | 说明 | v1.0 行为 |
|---|---|---|
| `manual` | 策划手填字段 | 可编辑，输出静态值 |
| `generated` | configer 根据规则生成的字段 | 不可手填，输出静态值 |
| `formula` | 原 Excel 公式字段 | 仅用于规则提取和追溯，不作为输出运行机制 |
| `ref` | 关联字段或引用字段 | 默认只读，除非 schema 明确标为手填引用 |
| `imported` | 外部表导入或公式拉取字段 | 默认只读，由来源表或生成规则决定输出 |
| `hidden` / `deprecated` | 隐藏或废弃字段 | 默认不编辑，不作为新增规则依据 |

输出只能写入 schema 和模块输出契约允许的字段。未来模块应把原 Excel 公式迁移为 `generated` 规则，由 configer 计算并输出静态值。

## source / target 目录协议

运行时使用两个用户选择的功能根目录：

- `sourceRoot`：只读来源目录，用于加载现有 Excel、提取公式规则、建立 baseline 和做测试对比。
- `targetRoot`：目标输出目录，用于写入 configer 生成的真实产物。

工具不得修改 `sourceRoot` 中的文件。输出文件必须按源文件相对 `sourceRoot` 的路径镜像到 `targetRoot`。

```text
sourceRoot/equip/equip.xlsx
  -> targetRoot/equip/equip.xlsx
sourceRoot/language/language.xlsx
  -> targetRoot/language/language.xlsx
```

v1.0 必须阻止 `sourceRoot` 与 `targetRoot` 相同或互相包含。覆盖 `targetRoot` 中已有目标文件前必须备份目标文件。

## 输出契约规则

目标 Excel 默认不保留公式。输出文件必须保证游戏导出流程需要的结构稳定：

- 保留 4 行表头。
- 保留 sheet 名称。
- 保留字段顺序。
- 保留字段中文名、导出标记、数据类型和源字段名。
- `manual` 字段输出用户编辑后的静态值。
- `generated` 字段输出 configer 规则计算后的静态值。
- 只读关联表不出现在 v1.0 输出变更集合中。
- 输出后生成 changelog，记录目标文件路径、变更内容和备份位置。

原 Excel 中的公式必须在 `docs/40_game_config/<module>/` 中解释清楚，并迁移为规则说明、schema、规则代码和测试用例。

## 解析失败处理

以下情况必须阻止相关表进入可写状态：

- 少于 4 行表头。
- 必要字段缺失。
- schema 声明字段无法映射到源列，且模块输出契约没有说明处理方式。
- 主键字段为空或重复。
- 字段类型无法解析且影响输出安全。

错误信息必须包含文件、sheet、行、列和原因，方便策划或工具维护者定位。

## 参考来源

- `docs/40_game_config/equip/01_source_tables.md`
- `docs/40_game_config/equip/08_target_contract.md`
- `docs/90_reference/equip_reference/01_表结构与导出规则.md`
- `docs/90_reference/equip_reference/12_装备配置工具设计规范.md`
- `docs/20_architecture/data_lifecycle.md`
- `docs/30_development/coding_standard.md`
