# 验收样例

状态：Active

本文提供本模块的最小验收数据。样例应能转化为自动化测试 fixture。

## 最小合法配置

| 输入 | 预期生成 | 预期校验 |
|---|---|---|
| `<manual fields>` | `<generated fields>` | 通过 |

## ID 冲突样例

| 输入 | 预期结果 |
|---|---|
| `<duplicate input>` | 阻止输出并提示冲突字段 |

## 关联缺失样例

| 输入 | 预期结果 |
|---|---|
| `<missing ref>` | 报告目标表和目标主键 |

## target 输出样例

| source 相对路径 | target 相对路径 | 预期 |
|---|---|---|
| `<module>/<table>.xlsx` | `<module>/<table>.xlsx` | 路径镜像，字段值符合规则 |
