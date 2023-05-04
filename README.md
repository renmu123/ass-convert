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
-i2 --input2
-cg --cleanGift 清除礼物弹幕，如果你在弹幕姬开启了礼物记录(default: true，不包含sc)
-bl --blockLevel 片哥过滤机制，详细看文档，可选参数为1,2,3(default: 0)

-h, --help display help for command

```

# 例子

## 修改 SC 动画以及持续时间

`node index.js assConvert -i example.ass -o example2.ass -cg -d 15`

## 片哥过滤功能

`node index.js assConvert -i example.ass -i2 example.xml -o example2.ass -bl 1`

某些人的直播间特别多的片哥，比如柯洁，所以特地写了一个片哥过滤功能，不同的片哥有不同的特征，大致有如下几种：

1. 关键词中带有`伦乱,泗,𐊿`等违规文字以及某些谐音字来规避平台的检测
2. 比如一些抽象片哥弹幕，`校园尚扪快餐获nl取站6k3w⦁C0𖬪`,`校园尚扪快餐获j5取站6k3w⦁C0𖬪`，特点是文字大致相同，但中间参杂了随机的英文字母或数字
3. 片哥的用户名一般以`bili_`开头

根据这几个特征做了三个不同等级的屏蔽策略，防护程度以此上升，尽量不伤及正常弹幕。
PS：怎么还有复制片哥弹幕的

### 第一级

关键词过滤，如检测`伦乱,泗,𐊿`等非常见字符进行屏蔽，错杀概率最小。

### 第二级

去除所有的英文以及数字字符后做统计，将发了 5 个重复弹幕以及用户名以`bili_`开头的用户屏蔽，有小错杀概率

### 第三级

屏蔽所有以`bili_`开头的用户，对片哥杀得比较彻底，但错杀范围较大。

## 生成高能进度条

`node index.js genDanmukuImage -in 30 -i example.ass -w 1920 -h 60 -o example`

## 生成弹幕报告

`node index.js report -i example.ass -i2 example.xml -in 60 -o report.txt`

# 更新记录

# 2.0.0

命令行更改

# 1.9.0

1. 生成报告内容中增加最能水弹幕的人数据
2. 生成报告内容中增加富哥数据
3. 片哥过滤功能

# 1.8.0

修复在只有一条 sc 时解析错误

# 1.7.0

增加进度高宽高参数

# 1.6.0

新增更多统计参数

# 1.5.1

修复 SC 可能重叠的 bug

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
