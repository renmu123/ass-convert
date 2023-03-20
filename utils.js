const fs = require("fs");
const path = require("path");

const { parse, stringify, compile, decompile } = require("ass-compiler");

const moveRegex = /{\\move\((.*?)\)\\(.+?)}/g;

const convertAss = (
  input,
  output = undefined,
  options = {
    duration: 5,
    replaceSource: false,
  }
) => {
  let outputPath = output;

  if (options.replaceSource) {
    outputPath = input;
  }
  if (!outputPath) {
    const { dir, name } = path.parse(input);
    outputPath = path.join(dir, `${name}_new.ass`);
  }

  // 读取Ass文件
  const assContent = fs.readFileSync(input, "utf8");

  // 解析Ass文件
  const assData = parse(assContent);
  const items = [];
  // console.log(assData);
  for (const item of assData["events"]["dialogue"]) {
    // console.log(item);
    if (item.Style === "message_box" && item.Text.raw.includes("clip")) {
      continue;
    }
    if (item.Style === "message_box" && item.Text.raw.includes("move")) {
      item.End = item.Start + options.duration;
      item.Text.raw = item.Text.raw.replace(moveRegex, (match, p1, p2) => {
        const [x1, y1, x2, y2] = p1.split(",");
        return `{\\pos(${x2},${y2})\\${p2}}`;
      });
    }
    items.push(item);
  }
  assData["events"]["dialogue"] = items;

  // 将修改后的Ass数据转换回字符串
  const newAssContent = stringify(assData);

  // 将修改后的Ass数据写入到新文件中
  fs.writeFileSync(outputPath, newAssContent, "utf8");
};

convertAss("example.ass");
module.exports = convertAss;
