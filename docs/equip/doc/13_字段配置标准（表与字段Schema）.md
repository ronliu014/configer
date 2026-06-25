# 13 · 字段配置标准（表 / 字段 Schema）

> 把"每张表怎么显示、每个字段怎么生成与校验、哪些字段可关联下钻"抽成一份**声明式配置（schema）**，工具读它来渲染界面 + 执行生成/对账/下钻，而不是给每张表写死一段渲染代码。
> 本篇是 [11 控件词表](11_对标发行活动配置工具的工具化分析.md) + [12 设计规范](12_装备配置工具设计规范.md) 的**机器可读化**：字段明细仍以 [05](05_字段清单表.md) / [09](09_关联表字段清单.md) 为权威来源，编码规则以 [04](04_ID编码规则速查.md) 为准；本篇只定义"配置的结构"并把这几张表填出来。
> **本轮范围**：equip、item、equip 的 7 张一级关联表（job_group / proplib / random_proplib / special_drop / suit / rare / skill_drop）、language（下钻终点）。二级表（soul / prop / special_prop / skill_effect / skill）先只在 `ref` 里指向，字段 schema 留后续。

---

## 一、为什么每张表都要配置规则（关联下钻的根因）

详情页点一个关联字段 🔗 → 抽屉里渲染**目标表的一条记录** → 这条记录里又有字段能继续点 🔗 下钻。要让这套通用化，工具必须对**每一张可能被下钻到的表**都知道三件事：

1. **这张表的每个字段怎么显示**（控件类型、标签、是否进列表/抽屉、格式化）；
2. **哪些字段是"可下钻的关联字段"**，点了之后**查哪张表的哪条/哪组**；
3. **一条记录怎么用一句话概括**（下钻列表、面包屑、命中提示都要用）。

demo 现状是把这三件事**给每张表写死在 `renderEntry()` 的 if-else 里**——加一张表就要改代码。本篇用"表级 + 字段级 schema"把它们外置成配置，工具变成**一套通用渲染器 + 一份配置数据**。

> 这也顺带解决了"单一数据源"问题：编码规则、控件类型、关联指向只在 schema 里写一份，demo 公式与 doc 04 漂移那类问题从根上消失（见 [12 §十一](12_装备配置工具设计规范.md)）。

---

## 二、两级 Schema 总览

```
TableSchema（表级 · 每张表一份）
  ├─ name / label          表名 / 中文名
  ├─ pk                    主键字段
  ├─ groupKey?             分组键（一对多的库表才有，如 special_drop 按 DropID 分组）
  ├─ tier                  层级：main(equip) / item / lib-1(一级库) / lib-2 / common(通用)
  ├─ summary               记录摘要模板（下钻列表/面包屑/命中提示用）
  ├─ listCols[]            列表/抽屉默认展示的字段
  ├─ groups[]              详情分组（把字段归到"基础维度/属性等级/外观…"）
  └─ fields[]              字段级 schema 数组（见下）

FieldSchema（字段级 · 每个字段一份）
  ├─ 标识属性  key（工具内稳定唯一 key）/ srcCol（源表列坐标，如 N/P）/ srcName（源表字段名，如 Remark10）
  ├─ 显示属性  control / label / group / order / inList / inDetail / format / readonly / visible
  └─ 规则属性  source / required / enumSource / encode / ref / status
```

> **★ 字段 key 与源表列名解耦（重要规约）**：schema 的字段 `key` 是**工具内自定义的稳定语义名**（如 `itemQuality` / `equipTier`），**不直接用源表 Remark 名**；源表名只作 `srcName` 追溯、列位置作 `srcCol`。
> 原因：源表 N 类字段（Remark 草稿列）只供 Excel 内部计算/标注、**不导出**，且 **Excel 公式按单元格坐标（N5/P5）引用、不认字段名**——所以源表里 Remark 编号跳号、甚至**两列同名（N/P 都叫 Remark10）对 Excel 与游戏运行零影响**，才会长期存在没人改。
> 但工具化后**按字段 key 索引**配置与规则，源表名一旦撞名就会撞键、AI 助手/对账器会歧义。用稳定 `key` + `srcCol/srcName` 映射后，撞名、改名、编号混乱**全部与工具解耦**——§五的 `Remark10_jiji / Remark10_rare` 即此规约的临时体现（落 JSON 时建议进一步取语义名 `equipTier / itemQuality`）。

---

## 三、字段 Schema 属性字典

### 3.1 显示属性

| 属性 | 取值 | 说明 |
|------|------|------|
| `control` | 见 3.6 控件枚举 | 用哪种控件渲染/编辑 |
| `label` | 中文 | 字段显示名 |
| `group` | 分组名 | 详情里归到哪个分组（表级 `groups` 之一） |
| `order` | 数字 | 同组内排序 |
| `inList` | bool | 是否进**列表/抽屉摘要列** |
| `inDetail` | bool | 是否在详情/抽屉完整视图显示（弃用字段=false） |
| `format` | 见 3.5 | 值如何格式化（枚举→中文、品质→色标签、数值原样） |
| `readonly` | bool | 是否只读（公式生成/固定值=true） |
| `overridable` | bool | 公式生成但**允许策划手写覆盖**（默认 false；如装备描述内容）。为 true 时 control 用可编辑控件、readonly=false |
| `visible` | bool | 整体可见性；弃用字段 `false`（保留定义、不渲染） |

### 3.2 规则属性

| 属性 | 取值 | 说明 |
|------|------|------|
| `source` | `manual` / `formula` / `ref` / `combo` / `imported` | 来源：手填 / 本表公式 / 关联字段 / 关联组合（对齐 05 四分类）；外加 `imported`=值由 FILTER 等从**外部主表导入**、本表既不手填也不自算（如 equip_special_drop 的 B~E 列），**AI 助手不为它生成 encode** |
| `required` | bool | 手填字段是否必填（添加页红 `*`） |
| `enumSource` | 字典源引用 | 下拉/枚举选项来自哪（如 `Sheet4.品质表`、`equip_rare`） |
| `encode` | 见 3.4 | 公式/自洽编码字段的**声明式拼接规则**（生成 + 校验共用一份） |
| `ref` | 见 3.3 | **关联下钻描述**（source=ref/combo 必填） |
| `validate` | `dangling` / `dimension` / … | 该字段参与哪些对账校验（悬空外键 / 维度一致性） |
| `status` | `enabled` / `deprecated` | 启用 / 弃用（承载 05、09 里【不再使用】【暂未启用】⛔ 等标注） |

### 3.3 `ref`：关联下钻描述（★ 本篇核心）

凡 `source=ref` 或 `combo` 的字段都要带 `ref`，告诉工具"点了这个 🔗 去查谁"：

```
ref: {
  table:  目标表名,
  field:  目标表里用来匹配的字段（通常是 pk 或 groupKey）,
  kind:   single | group | combo | self,
  parse?: 当 kind=combo 时，如何把字符串串拆成多个子 ID,
  weightField?: 当 kind=group 时，目标表里哪一列是随机权重（抽屉渲染整组时高亮该列、可估命中概率），
                如 special_drop.Weight / skill_drop.Weight / random_proplib.Weight,
  target?: 默认指向他表；指回本表时标 self-table（与 self 配对语义区分，见下）,
}
```

**`kind` 四类**：

| kind | 含义 | 例子 |
|------|------|------|
| `single` | 单外键 → 目标表**一条**记录 | equip.PropLibID → equip_proplib（一条） |
| `group` | 分组键 → 目标表**一组**（同 key 多行，走权重） | equip.DropID → equip_special_drop（一组候选） |
| `combo` | 字段是**组合串**，先按 `parse` 拆成多个子 ID，每个子 ID 再 single/group | equip.FixedPropLibID（随机库串）、item.SellItems |
| `self` | **配对自关联**：指回本表**同一对**记录的另一条（双向入口） | item.BindItemId ↔ item.UnBindItemId（非绑↔绑定配对） |

> ⚠️ `self` 仅指"配对跳转"（如非绑↔绑定）。若字段是"指向本表**多条**记录"（如 equip_rare.EquipSwallow 的 "5,6,7"），应用 `combo→single` + `target:self-table`，渲染为"多候选列表"，**不要用 self**。

**`parse`（combo 专用）** 用"分隔符 + 取值位置"声明（白话：`"50111,2"` 按 `;` 切段、每段按 `,` 取第 1 个=50111），例：

```
FixedPropLibID  "50111,2;50115,0"   → split(';') 每段 split(',')[0]  得 [50111,50115]，各 → random_proplib(group)
RandonSkillID   "5070;6070"          → split(';')                      得 [5070,6070]，各 → equip_skill_drop(group by SkillGroup)
proplib.Props   "25,29;14,8"         → split(';') 每段 split(',')[0]  得 [25,14]，各 → prop(single)
item.SellItems  "1000,1000"          → split(';') 每段 split(',')[0]  得 [1000]，  各 → item(single)
```

### 3.4 `encode`：声明式编码规则（生成 + 校验共用）

把 [04 文档](04_ID编码规则速查.md) 的拼接公式从"散文"变成结构化段定义。**生成**用它拼 ID、**对账**用它反查库 PK——同一份规则，从机制上杜绝"两侧规则不一致 → 悬空外键"。

段语法：`[字段:位数:补零]`，可带 `条件偏移` 与 `追加段`。

| 字段 | encode（声明式） |
|------|------------------|
| 种类/装备ID | `"3" + [部位:2:pad] + [基础职业] + [转数] + [1-2转分支] + [品质] + [真实等级:3:pad]`；撞 ID 时 `+COUNTIF` 错开 |
| 使用职业限制 GroupID（equip 侧） | `IF(转数<2 且 非武器, [基础职业]+[转数]+"0"+[1-2转分支]+10, 同前·不+10) + [3转分支]`——✅ **已核实 `equip.xlsx` C 列实际公式**。+10 加在十位 = 武器(0)/防具(1)区分位 |
| 初始基础属性库 PropLibID | `[物理魔法:1] + [部位:2:pad] + [转数] + [品质:2:pad] + [转数等级:3:pad]` |
| 垃圾库 / 高级库 | `"5" + [部位:2:pad] + "11"` ／ `"5" + [部位:2:pad] + "15"` |
| 远古库 / 太古库 | `"6"/"7" + [部位:2:pad] + "35"`（品质≥6 / =7 才拼）`status:deprecated`（暂未启用） |
| 特殊属性库 DropID | `"1" + [转数] + [部位:2:pad] + [件数修正:2:pad] + [职业&分支:2]`；仅备注含"特效"时生成 |
| 图鉴套装ID | `[职业] + [转数] + [分支] + ([件数]-1)`；仅备注含"套装"时生成 |
| 名称/描述 Key | `"EquipName_"+装备ID` ／ `"EquipDes_"+装备ID` |
| 技能随机库行ID equip_skill_drop.ID | `[SkillGroup] + [组内编号:3:pad]`（如 5070+001 → 5070001） |

> **可执行子集边界**（保证"声明式 schema 可被通用执行器跑"）：encode 由两类构成——
> ① **纯段表达式** `[字段:位数:补零] + 常量 + 拼接/简单算术(如 件数-1)`：通用执行器**可直接解析执行**；
> ② **具名规则** `具名规则:<名>`（如 件数修正 = `IF(品质>4 且 肩膀, 件数-3, 件数-1)`）：跳出到代码函数，执行器**按名调用**。
> 复杂条件分支一律走 ②、不塞进 ①。AI 助手生成含具名规则的 encode 时，**必须同步产出该规则体的可执行草案**（见 §八），不能只留占位。

### 3.5 `format` 枚举

`raw`(原样) ／ `enum:<字典>`(编号→中文，如 `enum:部位`) ／ `quality`(品质色标签) ／ `lang-preview`(语言包 Key → 显示中文) ／ `mono`(等宽，ID 类) ／ `list`(逗号/分号串展开成列表)。

### 3.6 `control` 控件枚举（对齐 doc 11 词表 / doc 12 三态）

| control      | 中文            | doc11 代号 | source 通常         | 视觉三态(doc12) |
| ------------ | ------------- | -------- | ----------------- | ----------- |
| `select`     | 下拉单选          | 4-1      | manual            | 手填          |
| `int-input`  | 整型文本框         | 3-int    | manual            | 手填          |
| `text-input` | 文本框           | 3        | manual            | 手填          |
| `resource`   | 资源选择器         | 3-res    | manual            | 手填          |
| `lang`       | 语言包（带中文预览）    | 6        | ref               | 关联 🔗       |
| `ref-picker` | 关联库引用（选已存在条目） | 7        | ref/combo         | 关联 🔗       |
| `switch`     | 特效/套装/技能开关    | 8        | manual            | 手填          |
| `gen`        | 逻辑生成（只读）      | 999      | formula/ref/combo | 自动 / 关联 🔗  |
| `fixed`      | 固定值（锁定）       | 2        | formula           | 手填(灰)       |
| `hidden`     | 空/弃用          | 0        | —                 | 不渲染         |

> **三态 ↔ control 关系**：`source` 决定三态大类（手填/自动/关联），`control` 是大类下的具体控件。关联字段即便由公式拼出（自洽编码），三态仍是"关联 🔗"（可下钻），control 是 `gen`（不可编辑）—— 二者不冲突。

---

## 四、表级 Schema（8 张表 + language）

| 表 | label | pk | groupKey | tier | summary（一条怎么概括） | 下钻列表列(listCols) |
|----|-------|----|----|------|------------------------|---------------------|
| `equip` | 装备 | EquipID | — | main | `{备注}` | 图标·装备ID·备注·部位·职业·转数·品质·穿戴等级·标记 |
| `item` | 道具 | ItemId | — | item | `{道具名字·中文}（{绑定?绑定:非绑}）` | 道具ID·名称·品质·绑定态·页签 |
| `equip_job_group` | 职业组 | GroupID | — | lib-1 | `{说明}` | 组ID·基础职业·转数·分支·说明 |
| `equip_proplib` | 固定属性库 | PropLibID | — | lib-1 | `{备注}` | 属性库ID·备注·属性值 |
| `equip_random_proplib` | 随机词条库 | SID | RandomPropLib | lib-1 | `随机库 {RandomPropLib}` | 随机库ID·候选词条(属性/基准值/权重) |
| `equip_special_drop` | 特效库 | ID | DropID | lib-1 | `特效库 {DropID}` | 特效库ID·条目(效果/权重) |
| `equip_suit` | 套装 | SuitId | — | lib-1 | `{套装名}` | 套装编号·套装名·总数 |
| `equip_rare` | 品质表 | EquipRare | — | lib-1 | `{道具品质名} 档` | 装备品质·道具品质·子品质 |
| `equip_skill_drop` | 装备技能随机库 | ID | SkillGroup | lib-1 | `技能组 {SkillGroup}` | 技能组ID·候选技能(效果备注/权重) |
| `language` | 语言表 | Id | — | common | `{Zhs·中文}` | Key·中文 |

> **groupKey 的意义**：`random_proplib / special_drop / skill_drop` 是"一个库 ID 对应多行候选、走权重"的分组表。equip 的外键指向的是 **groupKey**（一组），不是单行 pk——所以 `ref.kind=group`，抽屉里渲染**整组**（带权重列），而非一条。

**二级表「最小查看 schema」**（soul / prop / equip_special_prop / equip_skill_effect / skill）：本轮不配可编辑字段，但为保证"任意表下钻"不在第二跳断裂，每张二级表至少声明 `pk / label / summary / listCols / 二级 ref 指向`，统一标 `readonly:true`（**本期只读查看、不可编辑**）：

| 二级表 | pk | summary | 关键二级 ref（继续下钻） |
|--------|----|---------|------------------------|
| `soul` | SoulID | `{职业定位}` | Name→language；ParentId→soul（自关联） |
| `prop` | Id | `{属性名}` | PropName→language |
| `equip_special_prop` | PropID | `{效果备注}` | Prop→skill；PropName→language |
| `equip_skill_effect` | EquipSkillEffectID | `{套装名}` | EquipSkillId→skill；SuitName→language |
| `skill` | Id | `{备注·技能名}` | （下游 buff/damage/param 技能子系统本期不展开） |

> 二级表字段明细见 [09](09_关联表字段清单.md)；下钻**优先 1 级**，到二级仅"只读查看"，需编辑二级表数据时再补全字段 schema。

---

## 五、字段级 Schema —— 逐表

> 表示法：每行 = 一个字段。**规则列**只在有内容时写（ref / encode / enum / 校验 / 弃用）。`source` 缩写：M=手填 F=公式 R=关联 C=组合。普通"中文翻译草稿列"（部位名/品质名等公式翻译）合并为一行带过，不逐列展开（明细见 05/09）。

### 5.1 equip（主表）

| 字段名(En)                  | 中文                   | source | control    | inList | 规则（ref / encode / enum / 校验 / status）                                                                                                                            |
| ------------------------ | -------------------- | ------ | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| EquipType                | 装备部位                 | M      | select     | ✓      | enum:`Sheet4.部位表`；required                                                                                                                                       |
| Remark3                  | 基础职业                 | M      | select     | ✓      | enum:`Sheet4.职业表`；required                                                                                                                                       |
| TransferNum              | 转数                   | M      | select     | ✓      | enum:`0~4`；required                                                                                                                                              |
| Remark6                  | 1-2转分支               | M      | select     |        | required                                                                                                                                                         |
| Remark28                 | 3转分支                 | M      | select     |        | 3转才填                                                                                                                                                             |
| Remark8                  | 品质                   | M      | select     | ✓      | enum:`Sheet4.品质表`；format:quality；required                                                                                                                        |
| Remark10_jiji            | 几级的装备                | M      | int-input  |        | required；⚠ ✅ **已核实源表 P 列字段名误写为 Remark10**、与 N 列「道具品质」撞名（见 [14·Q2](14_工具化设计评审意见.md)）——本列是**撞名错位项**，建议源表改未用编号；schema 用唯一 key `Remark10_jiji`                       |
| AccessoriesID            | 挂件ID                 | M      | resource   |        | enum:`Sheet4.挂件清单`；required（衣服走模型组）                                                                                                                              |
| Remark27                 | 装备图标                 | M      | resource   | ✓      | enum:`资源库`(待接)；required                                                                                                                                          |
| (开关)特效                   | 特效                   | M      | switch     |        | 驱动 DropID 生成                                                                                                                                                     |
| (开关)套装                   | 套装                   | M      | switch     |        | 驱动 图鉴套装ID + SuitId                                                                                                                                               |
| (开关)装备技能                 | 装备技能                 | M      | switch     |        | 驱动 RandonSkillID                                                                                                                                                 |
| EquipID                  | 装备ID                 | F      | gen        | ✓      | encode:种类（撞ID+1）；format:mono                                                                                                                                     |
| Remark1                  | 种类(SKU)              | F      | gen        |        | encode:种类                                                                                                                                                        |
| Remark                   | 备注                   | F      | gen        | ✓      | 拼中文说明（兼旧"特效/套装"标记位→已显式化为开关）                                                                                                                                      |
| UseJobRequest            | 使用职业限制               | R      | gen        |        | **ref:** job_group.GroupID `single`；encode:GroupID；validate:dangling,dimension                                                                                   |
| PropLibID                | 初始基础属性库id            | R      | gen        |        | **ref:** equip_proplib.PropLibID `single`；encode:PropLibID；validate:dangling,dimension                                                                           |
| FixedPropLibID           | 初始随机属性库id            | C      | gen        |        | **ref:** equip_random_proplib `combo→group`，parse:`库ID,条数;…`；validate:dangling                                                                                   |
| Remark14                 | 垃圾库                  | R      | gen        |        | **ref:** equip_random_proplib.RandomPropLib `group`；encode:垃圾库                                                                                                   |
| Remark15                 | 高级库                  | R      | gen        |        | **ref:** equip_random_proplib.RandomPropLib `group`；encode:高级库                                                                                                   |
| Remark17                 | 远古库                  | R      | gen        |        | **ref:** equip_random_proplib.RandomPropLib `group`；encode:远古库；status:deprecated                                                                                 |
| Remark18                 | 太古库                  | R      | gen        |        | 同上；status:deprecated                                                                                                                                             |
| DropID                   | 特殊属性库ID              | R      | gen        |        | **ref:** equip_special_drop.DropID `group`；encode:DropID（特效开关时）；validate:dangling                                                                                |
| Remark10_rare            | 道具品质                 | R      | gen        |        | **ref:** equip_rare.**EquipRare** `single`（按 equip 品质匹配主键，显示该行 `Rare` 值）；format:`映射取 Rare`；本列嵌于 `Remark9→10→11` 品质序列、为**正版 Remark10**；schema key `Remark10_rare` |
| Remark11                 | 强度子品质                | R      | gen        |        | **ref:** equip_rare.**EquipRare** `single`（匹配主键，显示该行 `StrengthRare` 值）；status:deprecated（暂未使用）                                                                   |
| Remark23                 | 名称语言包                | R      | lang       |        | **ref:** language.Id `single`；encode:`EquipName_+ID`；format:lang-preview                                                                                         |
| Remark25                 | 描述语言包                | R      | lang       |        | **ref:** language.Id `single`；encode:`EquipDes_+ID`；format:lang-preview                                                                                          |
| Remark26                 | 装备描述内容               | F      | text-input |        | 公式生成，可手写覆盖；**overridable:true**（readonly=false，见 §3.1）——source=F 的合理例外，渲染器据此放可编辑控件                                                                               |
| SuitId                   | 初始套装库                | R      | ref-picker |        | **ref:** equip_suit.SuitId `single`；套装开关时填                                                                                                                       |
| RandonSkillID            | 装备技能随机库              | C      | ref-picker |        | **ref:** equip_skill_drop `combo→group by SkillGroup`，parse:`组;组`；validate:dangling                                                                              |
| HankBookSuitId           | 图鉴套装ID               | F      | gen        |        | encode:图鉴套装ID（套装开关时）                                                                                                                                             |
| RealLevel                | 真实等级                 | F      | gen        |        | 查 `Sheet4.真实等级表`；**encode 输入**（拼 种类 / PropLibID）                                                                                                                 |
| Remark16                 | 转数等级                 | F      | gen        |        | =真实等级；**encode 输入**（拼 PropLibID）                                                                                                                                 |
| Level                    | 穿戴等级                 | F      | gen        | ✓      | 该转第一档真实等级                                                                                                                                                        |
| Remark12                 | 物理OR魔法               | F      | gen        |        | 物理=1/魔法=2；**encode 输入**（PropLibID 的物理魔法段）                                                                                                                        |
| Remark19                 | 当前件数                 | F      | gen        |        | 一套里第几件；**encode 输入**（件数修正 / 图鉴套装ID）                                                                                                                              |
| Remark20                 | 最大件数                 | F      | gen        |        | 查 `Sheet4.套数表`；件数循环用                                                                                                                                             |
| Remark2/7/9/13           | 部位名/分支职业名/品质名/物理魔法备注 | F      | gen        |        | **纯中文翻译展示列**（查 Sheet4）；不导出 N 列，非 encode 输入                                                                                                                       |
| CPType / CPValue         | 战力类型 / 战力计算          | F      | fixed      |        | 恒 1 / 6，锁定                                                                                                                                                       |
| AvatarGroupId            | 模型组id                | F      | gen        |        | **status:deprecated**（不再使用，详情不展示）                                                                                                                                |
| JobDropType              | 装备类型                 | F      | gen        |        | **status:deprecated**（不再使用）                                                                                                                                      |
| ShowTabId                | 投放展示页签               | R      | hidden     |        | **status:deprecated**（斗罗遗留）                                                                                                                                      |
| JobDropLimitLevel        | 掉落等级                 | M      | hidden     |        | **status:deprecated**（斗罗遗留）                                                                                                                                      |
| EquipPoint/EquipHankType | 散件点数/标签类型            | F      | gen        |        | 查 Sheet4                                                                                                                                                         |

### 5.2 item（道具配套表）

> item 与 equip 配套：每件装备配**非绑 + 绑定两条**，绝大多数字段相同，靠 BindItemId/UnBindItemId 互指。**18 个装备弃用字段统一 `status:deprecated, visible:false`**（清单见 09 表12），下面只列启用 + 关键互指字段。

| 字段名(En) | 中文 | source | control | inList | 规则 |
|------------|------|--------|---------|--------|------|
| ItemId | 道具ID | M | gen | ✓ | = 装备ID（非绑）/ "8"+装备ID（绑定）；encode 同 equip 种类；format:mono |
| Script | 脚本 | M | text-input | | 如 `equip Item` |
| ItemName | 道具名字 | R | lang | ✓ | **ref:** language.Id `single`（与 equip 共用 Key）；format:lang-preview |
| ItemDes | 道具描述 | R | lang | | **ref:** language.Id `single`；format:lang-preview |
| LabelDes | 类型描述 | R | lang | | **ref:** language.Id `single` |
| ItemIcon | 道具Icon | M | resource | ✓ | 资源库（待接） |
| BindItemId | 绑定物品ID | R | gen | | **ref:** item.ItemId `self`（非绑填，= "8"+本ID） |
| UnBindItemId | 未绑定物品ID | R | gen | | **ref:** item.ItemId `self`（绑定填，= 非绑ID） |
| Rare | 道具品质 | M | select | ✓ | enum:`item品质`(1白 2绿 3蓝 4紫 5金 6橙 7红)；**format:quality-item**（item 品质色系，区别于 equip 品质色，见 12 §二） |
| StrengthRare | 强度子品质 | M | int-input | | |
| LevelLimit | 道具等级限制 | M | int-input | | = 穿戴等级 |
| ButtonList | 按钮 | M | text-input | | 操作按钮列表 |
| BagID | 背包标签 | M | select | | 背包分类 |
| Sort | 整理权重 | M | int-input | | |
| StackNum | 叠加数量 | M | int-input | | 装备=1 |
| SellItems | 道具出售返还 | C | gen | | **ref:** item.ItemId `combo→single`，parse:`道具ID,数量`（返还货币行，复用已有） |
| ServerType | 服务器物品类型 | M | select | | 1货币…1001装备…(见列批注) |
| ClientType | 客户端物品类型 | M | select | | ⚠ 装备页仅少数有值，停用与否待策划确认 |
| ReceiveNotice | 获取通知 | R | lang | | **ref:** language.Id `single` |
| GainWay | 获取途径 | C | ref-picker | | **ref:** func表.funcID `combo`（下游 func 表本期不下钻） |
| LootId | 掉落表现 | R | gen | | **ref:** 掉落表 `single`（本期不下钻） |
| Remark2 | 装备部位 | M | hidden | | 草稿，仅装备页 |
| (弃用×18) | 模块/体型处理/包装描述/功能开放限制/拥有数量/稀有分类/限时/流程/Lua/四角图标/序列帧/特效/高级道具/自动分解/最大留存… | — | hidden | | **status:deprecated, visible:false**（整列为空=装备弃用，09 表12 ⛔） |

### 5.3 equip_job_group（职业组）

| 字段名 | 中文 | source | control | inList | 规则 |
|--------|------|--------|---------|--------|------|
| GroupID | 组ID | F | gen | ✓ | encode（job_group 侧实际公式，✅ 已核实 `equip_job_group.xlsx` A 列）：`[基础职业]+[转数]+[特殊定义]+[1-2转分支]+[3转分支]` 五段直拼。**「特殊定义」段 = equip 侧 +10 算出的 武器0/防具1 区分位**——两表公式形式不同、拼出 GroupID 一致（实测同为 10111 等），**自洽编码成立**（化解原 S1 疑虑） |
| JobID | 职业ID列表 | C | gen | | **ref:** soul.SoulID `combo→single`，parse:`,`；validate:dangling |
| ShowJob | 职业名称 | F | gen | | 客户端显示 |
| Remark | 部位名称(说明) | M | text-input | ✓ | summary 用 |
| BaseJob | 基础职业 | M | select | ✓ | enum:`Sheet4.职业表` |
| Remark2/3/4/5 | 转数/特殊定义/1-2转/3转分支 | M | select | ✓(转数) | 维度推算 |
| Remark6 | 自身职业 | R | gen | | **ref:** soul.SoulID `single` |

### 5.4 equip_proplib（固定基础属性库）

| 字段名 | 中文 | source | control | inList | 规则 |
|--------|------|--------|---------|--------|------|
| PropLibID | 属性库ID | M | gen | ✓ | encode:PropLibID（与 equip 同规则=自洽编码）；format:mono |
| Remark | 备注 | M | text-input | ✓ | summary |
| Props | 属性值 | C | gen | ✓ | **ref:** prop.Id `combo→single`，parse:`属性ID,数值;…`；format:list；validate:dangling |
| Remark2/6/9/11 | 部位/转数/品质/第几套 | M | — | | 维度推算（部位3、品质9 用于维度一致性核对） |

### 5.5 equip_random_proplib（随机词条库）

> 分组表：按 `RandomPropLib` 分组，equip 指向的是 groupKey（一组候选词条，走权重）。

| 字段名 | 中文 | source | control | inList | 规则 |
|--------|------|--------|---------|--------|------|
| RandomPropLib | 随机库ID | M | gen | ✓ | groupKey；5xxxx=普通属性库、1000x=技能/特殊库；format:mono |
| Type | 属性种类 | M | select | | 0无 1属性 2技能 |
| PropValueID | 属性id | R | gen | ✓ | **ref:** prop.Id `single`（Type=1 时）；validate:dangling |
| PropNum | 属性数值基准值 | M | int-input | ✓ | 按品质乘算（系数见 random_proplib_group，2级） |
| LevelGroupID | 属性类型 | M | select | | 1固定 2百分比 3固定+百分比 |
| Weight | 权重 | M | int-input | ✓ | 同库内非独立 |
| Remark8 | 备注(属性名) | M | text-input | | |
| PropType/ColorGroup/SkillScore… | 词条品质/颜色/技能评分 | M | — | | |

### 5.6 equip_special_drop（特效库）

> 分组表：按 `DropID` 分组（同库多条走权重）。本表 B~E 列由 FILTER 从外部主表导入，非手填。

| 字段名 | 中文 | source | control | inList | 规则 |
|--------|------|--------|---------|--------|------|
| DropID | 属性库ID | imported | gen | ✓ | groupKey；format:mono；**FILTER 从外部主表导入，非本表 encode**（见 §3.2 imported）。本表 B~E 列同此 |
| PropID | 属性ID | R | gen | ✓ | **ref:** equip_special_prop.PropID `single`；validate:dangling |
| Remark4 | 效果备注 | F | gen | ✓ | summary |
| Weight | 权重 | F | gen | ✓ | 同库内非独立 |

### 5.7 equip_suit（套装）

| 字段名 | 中文 | source | control | inList | 规则 |
|--------|------|--------|---------|--------|------|
| SuitId | 套装编号 | M | gen | ✓ | pk；format:mono |
| SuitName | 套装名称 | R | lang | | **ref:** language.Id `single`；encode:`Equip_SuitName_+编号`；format:lang-preview |
| Remark4 | 套装名 | M | text-input | ✓ | summary |
| Remark3 | 备注 | M | text-input | | 套装定位说明 |
| Icon | 图标 | M | resource | | |
| SuitSum | 套装总数 | M | int-input | ✓ | 件数上限 |

### 5.8 equip_rare（品质表）

| 字段名 | 中文 | source | control | inList | 规则 |
|--------|------|--------|---------|--------|------|
| EquipRare | 装备品质 | M | select | ✓ | pk；1绿~7太古；format:quality |
| Rare | 道具品质 | M | select | ✓ | 对应 item 品质 |
| RareDes | 道具品质名 | R | lang | ✓ | **ref:** language.Id `single`；encode:`RareDes_+道具品质`；summary |
| StrengthRare | 强度子品质 | M | int-input | | |
| StrengthRareDes | 强度子品质名 | R | lang | | **ref:** language.Id `single` |
| EquipSwallow | 进阶能吞噬的品质 | C | gen | | **ref:** equip_rare.EquipRare `combo→single` + `target:self-table`，parse:`,`（每个品质值 single 指向 equip_rare 一条；渲染为"多候选列表"，**非** item 那种配对 self） |

### 5.9 equip_skill_drop（装备技能随机库）

> 分组表：按 `SkillGroup` 分组（同组多条候选技能走权重）；每条经 EquipSkillEffectID 链到 equip_skill_effect（2级）。

| 字段名 | 中文 | source | control | inList | 规则 |
|--------|------|--------|---------|--------|------|
| ID | ID | F | gen | | encode:equip_skill_drop.ID（段定义见 §3.4）；format:mono |
| SkillGroup | 技能组ID | M | gen | ✓ | groupKey（被 equip.RandonSkillID 引用）；format:mono |
| EquipTypeList | 装备部位列表 | M | text-input | | enum:部位（多值逗号） |
| JobIDList | 职业要求 | C | gen | | **ref:** soul.SoulID `combo→single`，parse:`,`（多为空） |
| Remark4 | 效果备注 | M | text-input | ✓ | 技能中文名；summary |
| Weight | 权重 | M | int-input | ✓ | 同组内非独立 |
| EquipSkillEffectID | 关联技能效果编号 | R | gen | ✓ | **ref:** equip_skill_effect.EquipSkillEffectID `single`（同 ID 多行=一组件数档）；validate:dangling |
| Remark1 | 编号 | M | int-input | | 组内序号（拼 ID 用） |

### 5.10 language（通用语言表 · 下钻终点）

| 字段名 | 中文 | source | control | inList | 规则 |
|--------|------|--------|---------|--------|------|
| Id | 主键(Key) | M | gen | ✓ | 各表语言包字段指向它；format:mono |
| Zhs | 中文 | M | text-input | ✓ | summary（详情/抽屉直接预览中文，见 12 需求） |
| Remark3/Remark4 | 备注/模块 | M | — | | 草稿 |

> language 是**下钻链的终点**：所有 `control:lang` 字段最终落到这里，无再下钻字段。详情里 `format:lang-preview` 直接旁显中文，不必每次点开抽屉。

---

## 六、关联下钻关系总图（谁 → 谁 · kind）

```
equip ──UseJobRequest(single)──────────► equip_job_group ──JobID(combo→single)──► soul ──Name──► language
      ──PropLibID(single)──────────────► equip_proplib ───Props(combo→single)───► prop ──PropName──► language
      ──FixedPropLibID(combo→group)────► equip_random_proplib ─PropValueID(single)► prop
      ──DropID(group)──────────────────► equip_special_drop ──PropID(single)─────► equip_special_prop ──Prop(single)──► skill
      ──SuitId(single)─────────────────► equip_suit ──SuitName(single)───────────► language
      ──RandonSkillID(combo→group)─────► equip_skill_drop ─EquipSkillEffectID(single)► equip_skill_effect ─EquipSkillId─► skill
      ┄道具品质(映射查看·非真外键)┄┄┄► equip_rare ──RareDes(single)────────────► language
      ──名称/描述语言包(single)──────────► language
equip ══配套══► item ──ItemName(single)──► language
                    ──Bind/UnBindItemId(self)──► item
                    ──SellItems(combo→single)──► item
```

- **实线 = 本轮已配 schema 的一级关系**；箭头标 `ref.kind`。
- **soul / prop / special_prop / skill_effect / skill** 是二级（已配「最小查看 schema」，见 §四）；下钻**优先 1 级**，二级字段同样标 🔗、点击才展开、本期只读（[12 §六](12_装备配置工具设计规范.md)）。
- `group` 类（random_proplib / special_drop / skill_drop）抽屉里渲染**整组带权重**（权重列由 `ref.weightField` 指定，见 §3.3），不是单行。
- **equip_rare（道具品质 / 强度子品质）是"映射查看"、非真外键**（虚线 ┄）：equip 无独立存储列，按品质匹配 equip_rare 主键取映射值；点击可查看映射行，但**不参与悬空对账**（与 [11 §四](11_对标发行活动配置工具的工具化分析.md) "逻辑生成"口径统一）。

---

## 七、与 demo / 其他文档的关系 + 落地建议

| 关系 | 说明 |
|------|------|
| vs **05/09** | 05/09 是"人读的字段清单"；本篇是"机器读的配置"，字段口径以 05/09 为准、本篇引用不重抄明细 |
| vs **04** | `encode` 段定义以 04 为准；04 改规则 → 本篇 encode 同步 → 生成与对账自动一致 |
| vs **11/12** | `control` 沿用 11 控件词表、三态沿用 12；本篇是它们的结构化落地，未新造概念 |
| vs **demo** | demo 的 `renderEntry()` 硬编码、`requiredLibs()`、编码函数 应改为**读本篇 schema 的通用渲染/校验**；本轮先出规范，demo 改造另立任务 |

**落地建议（分层）**：

1. **schema 落成数据**：把第四/五节转成一份 JSON（`tables[]`，每表含 `fields[]`），作为单一数据源。
2. **通用渲染器**：抽屉/详情读 `TableSchema` 渲染——字段按 `control`+三态显示、`source=ref/combo` 的字段挂 🔗、点击按 `ref` 查目标表→递归渲染。一套代码覆盖所有表，替代 demo 的逐表 if-else。
3. **通用对账器**：`requiredLibs` 改为"扫 equip 的 ref 字段 → 按 encode 拼 ID → 按 ref.kind 查命中/缺失/异常"，不再为每张表手写。
4. **治理**：`status:deprecated` 字段统一隐藏可追溯；schema 带 `version`，改 encode 时触发全量重算（[12 §十一](12_装备配置工具设计规范.md)）。

**待确认**：
- item 序号25 `ClientType` 是否随其余 18 个一起停用（09 表12 已存疑，待策划）。
- 二级表（soul/prop/special_prop/skill_effect/skill）字段 schema 是否本轮一并补——本篇先到一级 + 终点 language，二级按"优先 1 级"暂留指针。

---

## 八、AI 辅助的规则编写与维护（让非技术人员也能配规则 ★）

第三~七节把"字段规则"结构化成了 `encode`/`ref`/`enum` 等 schema 片段——**可被工具执行**，但 `[字段:位数:补零]` 段语法、`kind=group/combo`、`parse` 拆解这些对策划仍有门槛。本节给 schema 配一个**自然语言 ↔ 结构化规则的双向翻译层（AI 助手）**：策划只描述"这个字段是怎么算/怎么关联的"，AI 落成可校验的 schema；反过来 AI 也能把现成规则讲成大白话——**就像本套文档现在做的字段逻辑分析，沉淀成工具内的常驻能力**。

### 8.1 定位：AI 是"翻译 + 校验"，不是"黑箱生成"

- AI 的产物**永远是结构化 schema 片段**（encode/ref/enum/status），不是自由文本，所以**可被工具执行、可被样例验证**——这是它和"让大模型直接算字段"的本质区别。
- AI **不直接改生产配置**：提议 → 策划审 diff → 确认落库（见 8.5 人在回路）。
- 复杂业务条件（如件数修正 `IF(品质>4 且 肩膀, 件数-3, 件数-1)`）AI 生成 `具名规则:` 占位 + 解释，规则体仍由技术确认（见 3.4）。

### 8.2 双向能力

**① 解释方向（schema / Excel 公式 → 人话）**——降低看懂门槛

输入现有 `encode` 或原始 Excel 公式，AI 输出：这个字段**取哪几个维度、怎么拼、为什么**，并给**反查示例**（拿一个真实 ID 倒推它代表什么）。本质是把 04 的"反查速查"、05 的字段备注从"人工写"变成"AI 按 schema 实时生成"。

```
策划点「使用职业限制」字段 → 问"这列怎么来的？"
AI：它 = 职业+转数+"0"+分支拼成的职业组ID，指向 equip_job_group。
    防具且转数<2 时十位+1（让防具指向更宽松的职业组）。
    例：头饰·战士·0转·分支1 → 1001 → 防具+10 → 10111。
    这是"自洽编码"：拼出的 ID 正好是 job_group 里已存在的那条主键。
```

**② 编写方向（人话 → schema）**——非技术人员配规则

策划用自然语言描述规则，AI 翻译成 schema 片段并回填到字段定义：

```
策划：「特殊属性库ID 只有备注里写了'特效'才生成，规则是
       1 + 转数 + 部位(两位) + 件数修正 + 职业和分支」
AI 产出：
  DropID: { source:formula, control:gen,
    encode: '"1" + [转数] + [部位:2:pad] + [具名规则:件数修正:2:pad] + [职业&分支:2]',
    condition: '备注 contains "特效"',
    ref: { table:'equip_special_drop', field:'DropID', kind:'group' },
    validate:['dangling'] }
  ⚠ 检测到「件数修正」是条件逻辑，已生成具名规则占位，请技术确认规则体。
```

### 8.3 AI 的"有据可依"（grounding — 像现在分析一样，不是凭空猜）

AI 推理时**喂给它的上下文**，决定了它像我们现在分析逻辑一样"有据可依"：

| 上下文来源 | 给 AI 提供什么 |
|-----------|---------------|
| 字典源（Sheet4 各表、equip_rare…） | 有哪些维度、每个维度的取值与含义 |
| 同表/邻表已有字段 schema | 命名习惯、已有 encode 段、可复用的 ref 目标 |
| [04](04_ID编码规则速查.md) 编码规则 | 段定义范式、补零/偏移/条件的写法 |
| [05](05_字段清单表.md)/[09](09_关联表字段清单.md) 字段语义 | 字段中文含义、来源四分类、关联指向 |
| 库表样例数据 | 真实 ID 形态，供 AI 反查校对（见 8.4） |

> 关键：AI 不是"猜一个公式"，而是**在这套已知字典 + 已有规则里做受约束的翻译**——和本套文档的人工分析同源，只是常驻在工具里、即时响应。

### 8.4 自动验证回路（自洽编码 → 拼了就能对账）

装备链的**自洽编码**天然给 AI 产出的规则一个客观检验手段，无需人肉判断对错：

```
AI 产出 encode → 喂 N 组真实维度 → 按规则拼出 ID → 拿去对应库对账
   ├─ 全部命中已存在的库 PK  → 规则大概率正确 ✔
   ├─ 拼出的 ID 撞号/越界     → 规则有误，AI 给出反例 ✘
   └─ 系统性悬空（都查无）     → 维度顺序/补零位数错，AI 定位到具体段 ✘
```

- **反例验证（防同源错误）**：若库本身按错误规则建成，新规则拼出的 ID 可能"恰好全命中"（同源错误，对账通过 ≠ 规则正确）。故 AI 须额外生成几组**应不命中**的越界维度（如品质=9、部位=99），确认规则在这些情况下拼出的 ID **确实不在库里**——证明规则有**区分度**，而非恒命中。
- 改规则时同样跑**历史数据回归**：老装备用新规则还能拼出原 ID 吗？会不会新撞号、新悬空？（对接 [12 §十一](12_装备配置工具设计规范.md) 的全量重算）。
- 这把"AI 写得对不对"从主观评审变成**可量化的对账通过率 + 区分度**。

### 8.5 人在回路 + 一致性回写

- **diff 审阅**：AI 改 schema 以"旧 → 新 + 影响面（哪些字段/装备受影响）"的 diff 呈现，策划确认才落库。
- **一致性回写**：改了 `encode`，AI **自动重写该字段的自然语言解释**（回填 05 风格的备注、04 的反查示例），保持"配置 ↔ 文档"同步——根治此前 05→09→11→12 手工同步的漂移。
- **版本与触发**：每次落库 schema `version+1`，按 [12 §十一](12_装备配置工具设计规范.md) 触发受影响装备的状态重算。

### 8.6 工具内交互形态

| 形态 | 说明 |
|------|------|
| **字段 AI 助手** | 字段编辑面板侧挂对话：点字段 → 问"怎么算"/说"改成…" → AI 解释或产出 schema diff |
| **用例验证器** | 填几组输入维度，实时显示 AI 按当前规则算出的结果 + 命中/悬空状态（8.4 的可视化） |
| **规则体检** | 对整表 schema 跑一遍：缺 ref 的关联字段、encode 与样例对不上、弃用字段仍被引用——AI 列清单 |

### 8.7 护栏与边界

1. **结构化产物**：AI 只能产出 schema 片段（可执行可校验），不接受"把逻辑写成一段说明文字了事"。
2. **以对账为准**：AI 自评 ≠ 正确；**样例对账 / 历史回归通过**才是验收线。
3. **具名规则留技术**：含分支条件、跨表聚合的复杂逻辑，AI 只生成占位 + 解释，规则体由技术补。
4. **不碰生产**：AI 全程在"提议"层，落库由人确认；高影响面改动（改 encode 影响全表）强制二次确认。

> 一句话：**schema 让规则可执行，AI 让规则可被非技术人员读写，自洽编码的对账让 AI 的产出可被自动验证**——三者合起来，策划用大白话就能安全地维护字段逻辑。
