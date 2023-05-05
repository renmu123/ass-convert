const fs = require("fs");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

const { parse, stringify, compile, decompile } = require("ass-compiler");
const { drawSmoothLineChart } = require("./draw.js");

const { XMLParser, XMLBuilder } = require("fast-xml-parser");

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

const uniqBy = (arr, predicate) => {
  const cb = typeof predicate === "function" ? predicate : (o) => o[predicate];

  return [
    ...arr
      .reduce((map, item) => {
        const key = item === null || item === undefined ? item : cb(item);

        map.has(key) || map.set(key, item);

        return map;
      }, new Map())
      .values(),
  ];
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

// 屏蔽卖片哥
const block = (options) => {
  let filterData = [];
  const { danmuku } = parseXmlObj(options.input2);
  if (options.blockLevel === 1) {
    // 关键词移除
    const blackWordList = [
      "伦乱",
      "泗",
      "𐊿",
      "Ӎ",
      "ꓟ",
      "国铲",
      "蛧",
      "城人",
      "鈤",
    ];
    filterData = danmuku
      .filter(
        (item) =>
          blackWordList.filter((word) => {
            return String(item["#text"]).includes(word);
          }).length > 0
      )
      .map((item) => {
        const time = item["@_p"].split(",")[0];
        const seconds = time.split(".")[0];
        const milliseconds = time.split(".")[1].slice(0, 2);

        return {
          text: String(item["#text"]),
          user: String(item["@_user"]),
          time: Number(`${seconds}.${milliseconds}`),
        };
      });
  } else if (options.blockLevel === 2) {
    // 文字字段中去除所有的英文以及数字字符后做统计弹幕次数
    const textFilterDanmuku = danmuku
      .map((item) => {
        item["#text_compare"] = String(item["#text"]).replace(
          /[a-zA-Z0-9]/g,
          ""
        );
        return item;
      })
      .filter(
        (item) =>
          item["#text_compare"].trim() && item["@_user"].startsWith("bili_")
      );
    // group by text
    const groupedDanmuku = Array.from(
      groupBy(
        textFilterDanmuku,
        (item) => `${item["#text_compare"]}|${item["@_user"]}`
      )
    ).filter((item) => item[1].length >= 5);

    filterData = groupedDanmuku
      .reduce((acc, cur) => {
        return [...acc, ...cur[1]];
      }, [])
      .map((item) => {
        const time = item["@_p"].split(",")[0];
        const seconds = time.split(".")[0];
        const milliseconds = time.split(".")[1].slice(0, 2);

        return {
          text: String(item["#text"]),
          user: String(item["@_user"]),
          time: Number(`${seconds}.${milliseconds}`),
        };
      });
  } else if (options.blockLevel === 3) {
    // console.log(
    //   danmuku.filter((item) => {
    //     if (item["#text"] === "哔那玩小r道具闺密⩉I57泗ꗠ90窘") {
    //       console.log(item);
    //     }
    //   })
    // );
    // 用户名移除
    filterData = danmuku
      .filter((item) => item["@_user"].startsWith("bili_"))
      .map((item) => {
        const time = item["@_p"].split(",")[0];
        const seconds = time.split(".")[0];
        const milliseconds = time.split(".")[1].slice(0, 2);

        return {
          text: String(item["#text"]),
          user: String(item["@_user"]),
          time: Number(`${seconds}.${milliseconds}`),
        };
      });
  }
  console.log(`预计${filterData.length}条片哥弹幕`);

  return filterData;
};

// 弹幕转换
const convertAss = (
  input,
  output = undefined,
  options = {
    duration: 15,
    replaceSource: false,
    cleanGift: true,
    blockLevel: 0,
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

  let filterData = [];
  if (options.blockLevel) {
    filterData = block(options);
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

    if (filterData.length > 0) {
      // 片哥屏蔽功能
      const filterFlag =
        filterData.filter((filterItem) => {
          return (
            filterItem.time === item.start &&
            filterItem.text === item.slices[0].fragments[0].text
          );
        }).length > 0;

      if (filterFlag) {
        continue;
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
    height: 60,
    width: 1920,
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

    let canvas = createCanvas(options.width, options.height);
    canvas = drawSmoothLineChart(items, canvas, options.width, options.height);
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

// 礼物价格计算，最后返回的是人民币价格，单位元
// <gift>，分别金瓜子和银瓜子礼物，银瓜子礼物不算入收入。金瓜子现在又成为金仓鼠，1000金仓鼠可兑换1元人民币，@_raw.total_coin 为这条总金瓜子数量
// @_raw.coin_type === "silver" 银瓜子礼物
// @_raw.coin_type === "gold" 金瓜子礼物
// <sc> @_price 为这条sc的人民币价格，换算成金瓜子需要乘1000
// <guard> @_raw.price*@_raw.num，单位金瓜子
const calculateGiftPrice = ({ gift, sc, guard }) => {
  const giftPrice = gift.reduce((acc, cur) => {
    const raw = JSON.parse(cur["@_raw"]);
    if (raw.coin_type === "gold") {
      return acc + raw.total_coin;
    }
    return acc;
  }, 0);

  const scPrice = sc.reduce((acc, cur) => {
    return acc + cur["@_price"] * 1000;
  }, 0);

  const guardPrice = guard.reduce((acc, cur) => {
    const raw = JSON.parse(cur["@_raw"]);
    return acc + raw.price * raw.num;
  }, 0);

  return (giftPrice + scPrice + guardPrice) / 1000;
};

const parseXmlObj = (input) => {
  const XMLdata = fs.readFileSync(input, "utf8");
  const parser = new XMLParser({ ignoreAttributes: false });
  let jObj = parser.parse(XMLdata);

  let danmuku = jObj?.i?.d || [];
  let sc = jObj?.i?.sc || [];
  let guard = jObj?.i?.guard || [];
  let gift = jObj?.i?.gift || [];

  // 在只有一条时，会解析成object形式，这里统一转换成array
  if (!Array.isArray(danmuku)) {
    if (typeof danmuku === "object") {
      danmuku = [danmuku];
    } else {
      danmuku = [];
    }
  }
  if (!Array.isArray(sc)) {
    if (typeof sc === "object") {
      sc = [sc];
    } else {
      sc = [];
    }
  }
  if (!Array.isArray(guard)) {
    if (typeof guard === "object") {
      guard = [guard];
    } else {
      guard = [];
    }
  }
  if (!Array.isArray(gift)) {
    if (typeof gift === "object") {
      gift = [gift];
    } else {
      gift = [];
    }
  }

  return { jObj, danmuku, sc, guard, gift };
};

// 生成弹幕报告
const generateReport = (input, output, options = {}) => {
  // 读取Ass文件
  const { danmuku, sc, guard, gift } = parseXmlObj(options.input2);

  const danmukuLength = danmuku.length;
  const scLength = sc.length;
  const guardLength = guard.length;

  const uniqMember = uniqBy(
    [...danmuku, ...sc, ...gift, ...guard],
    "@_user"
  ).length;

  // danmuku根据@_user进行groupby并统计数量，并取前5名
  const danmukuGroupByUser = Array.from(
    groupBy(danmuku, (item) => item["@_user"])
  ).map(([key, items]) => {
    return {
      user: key,
      value: items.length,
    };
  });
  danmukuGroupByUser.sort((a, b) => b.value - a.value);
  danmukuGroupByUser.splice(5);

  // 礼物价格根据@_user进行groupby并统计数量，并取前5名
  const priceDanmu = [
    ...sc.map((item) => ({ ...item, type: "sc" })),
    ...guard.map((item) => ({ ...item, type: "guard" })),
    ...gift.map((item) => ({ ...item, type: "gift" })),
  ];
  const giftGroupByUser = Array.from(
    groupBy(priceDanmu, (item) => item["@_user"])
  ).map(([key, items]) => {
    return {
      user: key,
      value: calculateGiftPrice({
        gift: items.filter((item) => item.type === "gift"),
        sc: items.filter((item) => item.type === "sc"),
        guard: items.filter((item) => item.type === "guard"),
      }),
    };
  });
  giftGroupByUser.sort((a, b) => b.value - a.value);
  giftGroupByUser.splice(5);

  // 总流水计算
  const giftPrice = calculateGiftPrice({ sc, guard, gift });

  // 解析Ass文件
  const assContent = fs.readFileSync(input, "utf8");
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

  const report = `弹幕总数：${danmukuLength}
互动人数：${uniqMember}
sc总数：${scLength}
上船总数：${guardLength}
流水：${giftPrice}元

富哥V我50：
${giftGroupByUser
  .map((item) => `用户：${item.user}，流水：${item.value}元`)
  .join("\n")}

谁是大水王：
${danmukuGroupByUser
  .map((item) => `用户：${item.user}，弹幕数量：${item.value}`)
  .join("\n")}

高能时刻：
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
