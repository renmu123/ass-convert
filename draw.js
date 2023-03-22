// 生成平滑曲线
function smoothCurve(points, tension) {
  var len = points.length;
  var x = new Array(len);
  var y = new Array(len);
  var result = new Array(len);
  var t1x, t2x, t1y, t2y, c1, c2, c3, c4;
  for (var i = 0; i < len; i++) {
    x[i] = points[i].x;
    y[i] = points[i].y;
  }
  for (var i = 1; i < len - 1; i++) {
    t1x = (x[i + 1] - x[i - 1]) * tension;
    t2x = (x[i + 2] - x[i]) * tension;
    t1y = (y[i + 1] - y[i - 1]) * tension;
    t2y = (y[i + 2] - y[i]) * tension;
    c1 =
      2 * Math.pow(x[i] - x[i - 1], 2) +
      3 * Math.pow(x[i - 1] - x[i], 2) * (x[i] - x[i - 1]);
    c2 =
      3 * Math.pow(x[i] - x[i - 1], 2) +
      2 * Math.pow(x[i - 1] - x[i], 2) * (x[i] - x[i - 1]);
    c3 =
      2 * Math.pow(x[i + 1] - x[i], 2) +
      3 * Math.pow(x[i] - x[i + 1], 2) * (x[i + 1] - x[i]);
    c4 =
      3 * Math.pow(x[i + 1] - x[i], 2) +
      2 * Math.pow(x[i] - x[i + 1], 2) * (x[i + 1] - x[i]);
    x[i] = (t1x * c1 + t2x * c2) / (c1 + c2);
    c1 =
      2 * Math.pow(y[i] - y[i - 1], 2) +
      3 * Math.pow(y[i - 1] - y[i], 2) * (y[i] - y[i - 1]);
    c2 =
      3 * Math.pow(y[i] - y[i - 1], 2) +
      2 * Math.pow(y[i - 1] - y[i], 2) * (y[i] - y[i - 1]);
    c3 =
      2 * Math.pow(y[i + 1] - y[i], 2) +
      3 * Math.pow(y[i] - y[i + 1], 2) * (y[i + 1] - y[i]);
    c4 =
      3 * Math.pow(y[i + 1] - y[i], 2) +
      2 * Math.pow(y[i] - y[i + 1], 2) * (y[i + 1] - y[i]);
    y[i] = (t1y * c1 + t2y * c2) / (c1 + c2);
  }
  for (var i = 0; i < len; i++) {
    result[i] = { x: x[i], y: y[i] };
  }
  return result;
}
// 绘制平滑曲线
function drawSmoothCurve(ctx, points, tension) {
  var len = points.length;
  var result = smoothCurve(points, tension);
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < len - 2; i++) {
    var xc = (points[i].x + points[i + 1].x) / 2;
    var yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  ctx.quadraticCurveTo(
    points[i].x,
    points[i].y,
    points[i + 1].x,
    points[i + 1].y
  );
  ctx.stroke();
}
// 绘制原始曲线
function drawCurve(points) {
  var len = points.length;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < len; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}
// 绘制点
function drawPoints(points) {
  var len = points.length;
  for (var i = 0; i < len; i++) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 3, 0, 2 * Math.PI);
    ctx.fill();
  }
}
// 绘制坐标轴
function drawAxis() {
  ctx.beginPath();
  ctx.moveTo(0, 150);
  ctx.lineTo(400, 150);
  ctx.moveTo(200, 0);
  ctx.lineTo(200, 300);
  ctx.stroke();
}
// drawAxis();
// drawCurve(points);
// drawPoints(points);
// drawSmoothCurve(points, tension);

// 绘制平滑折线图
function drawSmoothLineChart(data, canvas, width, height) {
  const ctx = canvas.getContext("2d");
  const tension = 0.4;

  const length = data.length;
  const maxValue = Math.max(...data.map((item) => item.value));
  const xRation = width / (length - 1);
  const yRatio = height / maxValue;

  const points = [];

  // 计算数据点的坐标
  for (var i = 0; i < data.length; i++) {
    const item = data[i];

    const x = i * xRation;
    const y = height - item.value * yRatio;
    points.push({ x: x, y: y });
  }

  drawSmoothCurve(ctx, points, tension);
  return canvas;
}

// 绘制折线图
function drawCurveChart(data, canvas, width, height) {
  const ctx = canvas.getContext("2d");

  const length = data.length;
  const maxValue = Math.max(...data.map((item) => item.value));
  const xRation = width / (length - 1);
  const yRatio = height / maxValue;

  const points = [];
  for (var i = 0; i < data.length; i++) {
    const item = data[i];

    const x = i * xRation;
    const y = height - item.value * yRatio;
    points.push({ x: x, y: y });
  }

  var len = points.length;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < len; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();
}

module.exports = {
  drawSmoothLineChart,
};
