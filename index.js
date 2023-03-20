const { program } = require("commander");
const convertAss = require("./utils.js");

program
  .requiredOption("-i, --input <type>", "输入文件路径")
  .option("-o, --output <type>", "输出文件路径")
  .option("-d, --duration <number>", "持续时间（秒）", 5)
  .option("-r, --replaceSource", "替换源文件", false);

program.parse();

const options = program.opts();
options.duration = Number(options.duration);

convertAss(options.input, options.output, options);
