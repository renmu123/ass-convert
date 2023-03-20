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
  const assData = compile(assContent);
  let items = [];
  // 移除message_box的动画样式
  for (const item of assData["dialogues"]) {
    if (item.style === "message_box" && item.clip) {
      // console.log(item);
      continue;
    }
    if (item.style === "message_box" && item.move) {
      item.end = item.start + options.duration;
      item.pos = {
        x: item.move.x2,
        y: item.move.y2,
      };

      delete item.move;
    }
    items.push(item);
  }

  // 修复重复的sc
  for (let i = 1; i < items.length; i++) {
    if (
      items[i].style === "message_box" &&
      items[i].pos &&
      items[i].start < items[i - 1].end &&
      items[i].start > items[i - 1].start
    ) {
      items[i].start = items[i - 1].end;
      items[i].end = items[i].start + options.duration;
    }
  }

  assData["dialogues"] = items;

  // 将修改后的Ass数据转换回字符串
  const newAssContent = decompile(assData);

  // 将修改后的Ass数据写入到新文件中
  fs.writeFileSync(outputPath, newAssContent, "utf8");
};

convertAss("example.ass");
module.exports = convertAss;
