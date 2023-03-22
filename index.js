const { program } = require("commander");
const { convertAss, generateDanmakuImage } = require("./utils.js");

program
  .requiredOption("-i, --input <type>", "输入文件路径")
  .option("-o, --output <type>", "输出文件路径")
  .option("-d, --duration <number>", "持续时间（秒）", 5)
  .option("-r, --replaceSource", "替换源文件", false)
  .option("-gdi, --genDanmukuImage", "生成高能弹幕图片", false)
  .option("-in, --interval <number>", "生成高能弹幕图片的间隔", 30);

program.parse();

const options = program.opts();
options.duration = Number(options.duration);
options.interval = Number(options.interval);

if (options.genDanmukuImage) {
  generateDanmakuImage(options.input, options.output, options);
} else {
  convertAss(options.input, options.output, options);
}
