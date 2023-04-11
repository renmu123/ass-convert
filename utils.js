const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const { parse, stringify, compile, decompile } = require("ass-compiler");
const { drawSmoothLineChart } = require("./draw.js");

const { XMLParser } = require("fast-xml-parser");

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
  const groupedMessageDialogues = Array.from(
    groupBy(sortedMessageDialogues, (item) => `${item.start}-${item.end}`)
  );

  // Loop through grouped dialogues
  for (let i = 1; i < groupedMessageDialogues.length; i++) {
    const lastDialogue = groupedMessageDialogues[i - 1][1][0];
    const lastDialogueStart = lastDialogue.start;
    const lastDialogueEnd = lastDialogue.end;

    const [currentDialogueStart] = groupedMessageDialogues[i][0]
      .split("-")
      .map(Number);
    const currentDialogues = groupedMessageDialogues[i][1];

    // If current dialogue start time is between last dialogue start and end times
    if (
      (currentDialogueStart > lastDialogueStart &&
        currentDialogueStart < lastDialogueEnd) ||
      currentDialogueStart < lastDialogueStart
    ) {
      // Update current dialogue start and end times
      currentDialogues.forEach((dialogue) => {
        dialogue.start = lastDialogueEnd;
        dialogue.end = lastDialogueEnd + options.duration;
      });
    }
  }

  const newItems = [
    ...otherDialogues,
    ...groupedMessageDialogues.reduce((acc, cur) => {
      return [...acc, ...cur[1]];
    }, []),
  ];

  return newItems;
};

// 弹幕转换
const convertAss = (
  input,
  output = undefined,
  options = {
    duration: 5,
    replaceSource: false,
    cleanGift: true,
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
    if (item.style === "message_box") {
      if (item.clip) {
        continue;
      }
      if (item.move) {
        item.end = item.start + options.duration;
        item.pos = {
          x: item.move.x2,
          y: item.move.y2,
        };

        delete item.move;
      }
      // 移除礼物相关弹幕
      if (options.cleanGift) {
        let flag = false;
        (item?.slices || []).map((slice) => {
          (slice?.fragments || []).map((fragment) => {
            if (fragment?.tag?.c1 === "BCACF7") {
              flag = true;
            }
          });
        });
        if (flag) {
          continue;
        }
      }
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

// 生成高能弹幕图片
const generateDanmakuImage = (
  input,
  output,
  options = {
    interval: 30,
  }
) => {
  // 读取Ass文件
  const assContent = fs.readFileSync(input, "utf8");

  // 解析Ass文件
  const assData = compile(assContent);

  const items = Array.from(
    groupBy(
      assData["dialogues"],
      (item) => Math.floor(item.start / options.interval) * options.interval
    )
  ).map(([key, items]) => {
    return {
      time: key,
      value: items.length,
      color: options.color,
    };
  });

  for (var i = 0; i < items.length; i++) {
    items[i].color = options.fillColor;

    let canvas = createCanvas(1920, 60);
    canvas = drawSmoothLineChart(items, canvas, 1920, 60);
    if (!fs.existsSync(options.output)) {
      fs.mkdirSync(options.output);
    }
    const out = fs.createWriteStream(
      path.join(options.output, `${String(i).padStart(4, "0")}.png`)
    );

    const stream = canvas.createPNGStream();
    stream.pipe(out);
  }
};

// 生成弹幕报告
const generateReport = (input, output, options = {}) => {
  // 读取Ass文件
  const XMLdata = fs.readFileSync(input, "utf8");
  const parser = new XMLParser();
  let jObj = parser.parse(XMLdata);
  // console.log(jObj);
  const danmukuLength = jObj?.i?.d?.length || 0;
  const scLength = jObj?.i?.sc?.length || 0;
  const guardLength = jObj?.i?.gift?.length || 0;

  // 解析Ass文件
  const assContent = fs.readFileSync(options.input2, "utf8");
  const assData = compile(assContent);

  const items = Array.from(
    groupBy(
      assData["dialogues"],
      (item) => Math.floor(item.start / options.interval) * options.interval
    )
  ).map(([key, items]) => {
    return {
      time: key,
      value: items.length,
    };
  });
  // 获取最多的弹幕数量的前几个时间段
  const topItems = items
    .sort((a, b) => b.value - a.value)
    .slice(0, options.top || 5);
  // console.log(items);

  const report = `弹幕总数：${danmukuLength}
sc总数：${scLength}
礼物总数：${guardLength}
弹幕最多的时间段：
${topItems
  .map((item) => `时间：${formatTime(item.time)}，弹幕数量：${item.value}`)
  .join("\n")}`;

  console.log(report);
  if (output) {
    fs.writeFileSync(output, report, "utf8");
  }
};

const formatTime = (time) => {
  const hours = Math.floor(time / 3600);
  time = time % 3600;
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
};

module.exports = { convertAss, generateDanmakuImage, generateReport };
