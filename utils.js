const fs = require("fs");
const path = require("path");
const assParser = require("ass-parser");
const assStringify = require("ass-stringify");

const dayjs = require("dayjs");
const customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);

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
  const assData = assParser(assContent);
  const items = [];
  for (const data of assData) {
    if (data.section === "Events") {
      for (const [index, item] of Object.entries(data.body)) {
        const value = item.value;
        if (value.Style === "message_box" && value.Text.includes("clip")) {
          continue;
        }
        if (value.Style === "message_box" && value.Text.includes("move")) {
          const startTime = dayjs(value.Start, "H:mm:ss.SS");
          const endTime = dayjs(value.End, "H:mm:ss.SS");
          // value.Start = startTime.add(options.duration, "second").format("H:mm:ss.SSS");
          value.End = endTime
            .add(options.duration, "second")
            .format("H:mm:ss.SSS");
          value.Text = value.Text.replace(moveRegex, (match, p1, p2) => {
            const [x1, y1, x2, y2] = p1.split(",");
            return `{\\pos(${x2},${y2})\\${p2}}`;
          });
        }
        items.push(item);
      }
      data.body = items;
    }
  }

  // 将修改后的Ass数据转换回字符串
  const newAssContent = assStringify(assData);

  // 将修改后的Ass数据写入到新文件中
  fs.writeFileSync(outputPath, newAssContent, "utf8");
};

// convertAss("example.ass");
module.exports = convertAss;
