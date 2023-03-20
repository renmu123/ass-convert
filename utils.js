const fs = require("fs");
const path = require("path");

const { parse, stringify, compile, decompile } = require("ass-compiler");

const groupBy = (arr, func) => {
  const map = new Map();
  arr.forEach((item) => {
    const key = func(item);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key).push(item);
  });
  return map;
};

const handleMessageBox = (items, options) => {
  const messageDialogues = items.filter((item) => item.style === "message_box");
  const otherDialogues = items.filter((item) => item.style !== "message_box");

  const sortedMessageDialogues = messageDialogues.sort(
    (a, b) => a.start - b.start
  );
  const grounpedMessageDialogues = Array.from(
    groupBy(sortedMessageDialogues, (item) => `${item.start}-${item.end}`)
  );
  for (let i = 1; i < grounpedMessageDialogues.length; i++) {
    const [lastDialogueStart, lastDialogueEnd] = grounpedMessageDialogues[
      i - 1
    ][0]
      .split("-")
      .map(Number);

    const [currentDialogueStart] = grounpedMessageDialogues[i][0]
      .split("-")
      .map(Number);
    const currentDialogues = grounpedMessageDialogues[i][1];

    if (
      currentDialogueStart > lastDialogueStart &&
      currentDialogueStart < lastDialogueEnd
    ) {
      currentDialogues.forEach((dialogue) => {
        dialogue.start = lastDialogueEnd;
        dialogue.end = lastDialogueEnd + options.duration + 1;
      });
    }
  }
  const newItems = [
    ...otherDialogues,
    ...grounpedMessageDialogues.reduce((acc, cur) => {
      return [...acc, ...cur[1]];
    }, []),
  ];

  return newItems;
};

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

  items = handleMessageBox(items, options);
  assData["dialogues"] = items;

  // 将修改后的Ass数据转换回字符串
  const newAssContent = decompile(assData);
  // 将修改后的Ass数据写入到新文件中
  fs.writeFileSync(outputPath, newAssContent, "utf8");
};

convertAss("example.ass");
module.exports = convertAss;
