# target 输出契约

状态：Active

本文定义本模块生成到 `targetRoot` 的文件契约。`sourceRoot` 只读，target 文件按源文件相对路径 1:1 镜像生成。

## 输出文件

| 表 | source 相对路径 | target 相对路径 | sheet | v1.0 输出 |
|---|---|---|---|---|
| `<table>` | `<module>/<table>.xlsx` | `<module>/<table>.xlsx` | `<sheet>` | 是 |

## 输出规则

- target 相对路径必须与 source 相对路径一致。
- 输出文件必须保留 4 行表头、sheet 名称、字段顺序、导出标记和类型行。
- 原 Excel 公式不作为输出机制。
- `manual` 字段写用户编辑值。
- `generated` 字段写 configer 计算值。
- 只读依赖表不输出变更。
- 覆盖已有 target 文件前必须备份。
- 输出成功后必须生成 changelog。

## 禁止事项

- 禁止写入 `sourceRoot`。
- 禁止把 `sourceRoot` 和 `targetRoot` 设为同一目录或互相包含。
- 禁止要求用户逐一配置目标文件路径。
