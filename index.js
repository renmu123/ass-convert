const { program } = require("commander");
const {
  convertAss,
  generateDanmakuImage,
  generateReport,
} = require("./utils.js");
const { version } = require("./package.json");

program.name("ass-convert").description("弹幕姬ass优化工具").version(version);

program
  .command("assConvert")
  .description("转换ass文件，移除动画，增加SC持续时间")
  .requiredOption("-i, --input <string>", "输入文件路径")
  .option("-o, --output <string>", "输出文件名")
  .option("-r, --replaceSource", "是否替换源文件", false)
  .option("-d, --duration <number>", "SC持续时间（秒）", 5)
  .option("-cg, --cleanGift", "清除礼物弹幕，不包含SC以及上舰", true)
  .option(
    "-bl, --blockLevel <number>",
    "片哥过滤机制，详细见文档，可选参数为1,2,3",
    0
  )
  .option("-i2, --input2 <type>", "开启片哥过滤时需要此参数")
  .action((options) => {
    options.blockLevel = Number(options.blockLevel);

    convertAss(options.input, options.output, options);
  });

program
  .command("genDanmukuImage")
  .description("生成高能弹幕图片")
  .requiredOption("-i, --input <string>", "输入ass文件路径")
  .option("-o, --output <string>", "输出文件夹路径")
  .option("-c, --color <string>", "高能弹幕进度条颜色", "#f9f5f3")
  .option("-in, --interval <number>", "生成高能弹幕进度条的间隔", 30)
  .option("-fc, --fillColor <string>", "高能弹幕进度条填充颜色", "#333333")
  .option("-h, --height <number>", "生成高能弹幕进度条的高度", 60)
  .option(
    "-w, --width <number>",
    "生成高能弹幕进度条的宽度，需设置为视频宽度",
    1920
  )
  .action((options) => {
    generateDanmakuImage(options.input, options.output, options);
  });

program
  .command("report")
  .description("生成弹幕报告")
  .requiredOption("-i, --input <string>", "输入ass文件路径")
  .option("-i2, --input2 <type>", "生成弹幕报告时输入的xml文件")
  .option("-o, --output <string>", "输出文件名")
  .option("-in, --interval <number>", "生成弹幕报告的间隔", 60)
  .action((options) => {
    generateReport(options.input, options.output, options);
  });

program.parse();
