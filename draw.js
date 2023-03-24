const fs = require("fs");
const { CanvasRenderingContext2D } = require("canvas");
const { polyfillPath2D } = require("path2d-polyfill");

global.CanvasRenderingContext2D = CanvasRenderingContext2D;
polyfillPath2D(global);

// 绘制平滑曲线
function drawSmoothCurve(ctx, points, width, height, color, fillColor) {
  var len = points.length;
  ctx.strokeStyle = color;

  if (fillColor) {
    ctx.fillStyle = fillColor;
  }

  let region = new Path2D();
  region.moveTo(points[0].x, points[0].y);
  for (var i = 1; i < len - 2; i++) {
    var xc = (points[i].x + points[i + 1].x) / 2;
    var yc = (points[i].y + points[i + 1].y) / 2;
    region.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }
  region.quadraticCurveTo(
    points[i].x,
    points[i].y,
    points[i + 1].x,
    points[i + 1].y
  );

  region.lineTo(points[i + 1].x, height);
  region.lineTo(0, height);
  region.closePath();

  ctx.fill(region);
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

// 绘制平滑折线图
function drawSmoothLineChart(
  data,
  canvas,
  width,
  height,
  color = "#333333",
  fillColor = undefined
) {
  const ctx = canvas.getContext("2d");

  const length = data.length;
  const maxValue = Math.max(...data.map((item) => item.value));
  const minValue = Math.min(...data.map((item) => item.value));
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

  drawSmoothCurve(ctx, points, width, height, color, fillColor);
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
