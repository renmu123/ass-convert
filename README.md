# 介绍

用于修改由 [DanmakuFactory](https://github.com/hihkm/DanmakuFactory) 生成的 [BililiveRecorder](https://github.com/BililiveRecorder/BililiveRecorder) 弹幕文件中的 sc 弹幕的相关样式

# 安装

1. `git@github.com:renmu123/ass-convert.git`
2. `npm i`
3. `node index.js -i example.ass`

# 打包

1. `npm run build`

# 使用

```
Usage: node index.js [options]

Options:
-i, --input <type> 输入文件路径
-o, --output <type> 输出文件路径
-d, --duration <number> 持续时间（秒） (default: 5)
-r, --replaceSource 替换源文件 (default: false)
-gdi --genDanmukuImage 生成高能弹幕进度条,
-in --interval 生成高能弹幕今进度条的间隔（秒） (default: 30)
-c --color 高能弹幕进度条颜色 (default: #333333)
-fc --fillColor 高能弹幕进度条填充颜色
-h, --help display help for command
```

# 更新记录

## 1.2.0

1. 支持生成高能弹幕进度条

## 1.1.0

1. 在多个 sc 时间冲突时，后移冲突的 sc 时间

## 1.0.0

1. 完成基础功能
