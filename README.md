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
-d, --duration <number> SC持续时间（秒） (default: 5)
-r, --replaceSource 替换源文件 (default: false)
-gdi --genDanmukuImage 生成高能弹幕进度条,
-in --interval 生成高能弹幕今进度条的间隔（秒） (default: 30)
-c --color 高能弹幕进度条颜色 (default: #f9f5f3)
-fc --fillColor 高能弹幕进度条已读颜色 (default: #333333)
-report --report 生成弹幕报告 (default:false)
-h, --help display help for command
-cg --cleanGift 清除礼物弹幕，如果你在弹幕姬开启了礼物记录(default: true，不包含sc)
```

# 例子

## 生成修改后的弹幕

`node index.js -i example.ass -r -cg`

## 生成高能进度条

`node index.js -gdi -in 30 -i example.ass -o example`

## 生成弹幕报告

`node index.js --report -i example.xml -i2 example.ass -in 60 - o report.txt`

# 更新记录

# 1.5.0

生成弹幕报告的数据从 xml 文件取

# 1.4.0

新增清除礼物参数

# 1.3.0

生成弹幕报告

# 1.2.2

1. 高能进度条样式修改，支持按进度分割生成系列图片

# 1.2.1

1. 修改高能进度条的样式展示

## 1.2.0

1. 支持生成高能弹幕进度条

## 1.1.0

1. 在多个 sc 时间冲突时，后移冲突的 sc 时间

## 1.0.0

1. 完成基础功能
