const { program } = require("commander");
const {
  convertAss,
  generateDanmakuImage,
  generateReport,
} = require("./utils.js");

program
  .requiredOption("-i, --input <type>", "输入文件路径")
  .option("-o, --output <type>", "输出文件路径")
  .option("-d, --duration <number>", "持续时间（秒）", 5)
  .option("-r, --replaceSource", "替换源文件", false)
  .option("-gdi, --genDanmukuImage", "生成高能弹幕进度条", false)
  .option("-c, --color <type>", "高能弹幕进度条颜色", "#f9f5f3")
  .option("-fc, --fillColor <type>", "高能弹幕进度条填充颜色", "#333333")
  .option("-in, --interval <number>", "生成高能弹幕进度条的间隔", 30)
  .option("-report, --report", "生成弹幕报告", false);

program.parse();

const options = program.opts();
options.duration = Number(options.duration);
options.interval = Number(options.interval);

if (options.genDanmukuImage) {
  generateDanmakuImage(options.input, options.output, options);
} else if (options.report) {
  generateReport(options.input, options.output, options);
} else {
  convertAss(options.input, options.output, options);
}
