// Get canvas and context
const canvas = document.getElementById("paintCanvas");
const ctx = canvas.getContext("2d");

const colorPicker = document.getElementById("colorPicker");
const clearBtn = document.getElementById("clearBtn");
const eraseBtn = document.getElementById("eraseBtn");
const lineThickness = document.getElementById("lineThickness");
const toolSelector = document.getElementById("toolSelector");
const undoBtn = document.getElementById("undoBtn");
const saveBtn = document.getElementById("saveBtn");

let painting = false;
let currentTool = "pencil";
let startX, startY;
let drawingHistory = [];
let currentImage = null;
let thickness = 5;
let currentColor = "#000000";

// Set canvas size
canvas.width = 800;
canvas.height = 600;
ctx.lineJoin = "round";
ctx.lineCap = "round";

// Save history for undo
function saveHistory() {
  drawingHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

// Redraw canvas from history
function redrawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (drawingHistory.length > 0) {
    ctx.putImageData(drawingHistory[drawingHistory.length - 1], 0, 0);
  }
}

// Start drawing
function startPosition(e) {
  painting = true;
  startX = e.clientX - canvas.offsetLeft;
  startY = e.clientY - canvas.offsetTop;
  currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (currentTool === "pencil") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
  }
}

// Stop drawing and save history
function endPosition() {
  if (painting) {
    saveHistory();
  }
  painting = false;
}

// Draw freehand pencil
function drawPencil(x, y) {
  ctx.lineWidth = thickness;
  ctx.strokeStyle = currentColor;
  ctx.lineTo(x, y);
  ctx.stroke();
}

// Draw shape
function drawShape(x, y) {
  ctx.putImageData(currentImage, 0, 0); // Restore previous canvas state

  ctx.lineWidth = thickness;
  ctx.strokeStyle = currentColor;

  if (currentTool === "line") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, y);
    ctx.stroke();
  } else if (currentTool === "rectangle") {
    ctx.strokeRect(startX, startY, x - startX, y - startY);
  } else if (currentTool === "circle") {
    const radius = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
    ctx.beginPath();
    ctx.arc(startX, startY, radius, 0, Math.PI * 2);
    ctx.stroke();
  } else if (currentTool === "triangle") {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(x, startY);
    ctx.lineTo((startX + x) / 2, y);
    ctx.closePath();
    ctx.stroke();
  }
}

// Mouse movement
canvas.addEventListener("mousemove", (e) => {
  if (!painting) return;
  
  const currentX = e.clientX - canvas.offsetLeft;
  const currentY = e.clientY - canvas.offsetTop;

  if (currentTool === "pencil") {
    drawPencil(currentX, currentY);
  } else {
    drawShape(currentX, currentY);
  }
});

// Undo function
function undoAction() {
  if (drawingHistory.length > 0) {
    drawingHistory.pop();
    redrawCanvas();
  }
}

// Event Listeners
canvas.addEventListener("mousedown", startPosition);
canvas.addEventListener("mouseup", endPosition);

// Undo button click
undoBtn.addEventListener("click", undoAction);

// Ctrl + Z for undo
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "z") {
    e.preventDefault();
    undoAction();
  }
});

// Tool selection
toolSelector.addEventListener("change", (e) => {
  currentTool = e.target.value;
});

// Save canvas
saveBtn.addEventListener("click", () => {
  const dataURL = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = "drawing.png";
  link.click();
});

// Clear canvas
clearBtn.addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawingHistory = [];
});

// Change color
colorPicker.addEventListener("input", (e) => {
  currentColor = e.target.value;
});

// Adjust thickness
lineThickness.addEventListener("input", (e) => {
  thickness = e.target.value;
});
