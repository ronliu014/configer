# 源表样例清单

状态：Active

本文记录当前本地 `source/table/default_ios/` 下可观察到的样例配表目录。`source/` 是本地资源目录认知，不是工具运行时的固定依赖，也不应提交到远端仓库。

## 目录结构

当前本地资源目录包含：

```text
source/table/default_ios/
  equip/
  item/
  language/
```

真实使用时，工具应由用户选择配表根目录，并按模块声明查找所需文件。

## v1.0 必需表

| 类型 | 路径 | 用途 |
|---|---|---|
| 装备主表 | `equip/equip.xlsx` | 装备业务线主数据 |
| 道具表 | `item/item.xlsx` | 装备配套非绑与绑定道具 |
| 语言表 | `language/language.xlsx` | 装备和道具文案 |

## v1.0 只读关联表

装备 MVP 需要加载但不写回的关联表包括：

- `equip/equip_job_group.xlsx`
- `equip/equip_proplib.xlsx`
- `equip/equip_random_proplib.xlsx`
- `equip/equip_special_drop.xlsx`
- `equip/equip_suit.xlsx`
- `equip/equip_rare.xlsx`
- `equip/equip_skill_drop.xlsx`
- `equip/equip_skill_effect.xlsx`
- `equip/equip_special_prop.xlsx`

这些表用于关联字段展示、只读下钻和主键存在性校验。v1.0 不新增、不编辑、不补建这些表。

## equip 目录当前样例

```text
equip.xlsx
equip_benediction.xlsx
equip_benediction_main.xlsx
equip_benediction_node.xlsx
equip_handbook_scorereward.xlsx
equip_handbook_suit.xlsx
equip_handbook_taskguild.xlsx
equip_job_group.xlsx
equip_part.xlsx
equip_pro_item.xlsx
equip_pro_raremax.xlsx
equip_pro_snap.xlsx
equip_proplib.xlsx
equip_random_proplib.xlsx
equip_random_proplib_group.xlsx
equip_random_proplib_level.xlsx
equip_random_proplib_skill.xlsx
equip_rare.xlsx
equip_skill_drop.xlsx
equip_skill_effect.xlsx
equip_skill_equipchange.xlsx
equip_special_drop.xlsx
equip_special_exprop.xlsx
equip_special_prop.xlsx
equip_suit.xlsx
equip_suit_prop.xlsx
equip_transform_weapon.xlsx
refine_extra_item.xlsx
refine_level.xlsx
refine_level_limit.xlsx
refine_level_prop.xlsx
refine_repair.xlsx
refine_repair_rate.xlsx
refine_resonance.xlsx
refine_resonance_sort.xlsx
refine_show.xlsx
refine_show_equip.xlsx
```

## item 目录当前样例

```text
item.xlsx
item_translation.xlsx
item_func.xlsx
item_colour.xlsx
item_use.xlsx
item_show.xlsx
item_num.xlsx
item_repeated.xlsx
item_harvest.xlsx
item_limit_drop.xlsx
item_multichoice.xlsx
item_rewards_preview.xlsx
item_blind_box.xlsx
item_blind_box_group.xlsx
unidentify_equip.xlsx
drop_box.xlsx
activity_drop_box.xlsx
activity_drop_box_func.xlsx
activity_drop_box_limit.xlsx
combine.xlsx
combine_temp.xlsx
combine_spmaterial.xlsx
decompose.xlsx
drug.xlsx
```

## language 目录当前样例

```text
language.xlsx
language_task.xlsx
language_type.xlsx
```

## 使用规则

- 不在实现中硬编码 `source/` 路径。
- 不把备份、changelog、临时导出放入 `source/`。
- 自动化测试不依赖 `source/` 作为唯一数据来源。
- 需要真实样例测试时，复制到测试 fixture 或临时目录。
- 文件清单变化时，更新本文和对应模块文档。
