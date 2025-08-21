import { useCallback, useEffect, useRef, useState } from "react";

const PathaoTask = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const drawingStateRef = useRef({
    isDrawing: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    dragOffsetX: 0,
    dragOffsetY: 0,
    selectRect: null,
    clickStartTime: 0,
    hasMove: false,
    fillColor: "gray",
  });
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

  const [rectangles, setRectangles] = useState([]);
  const [tempRect, setTempRect] = useState(null);
  const FILE_COLORS = ["#95eda7", "#ede695", "#919df2", "#f291f1"];
  const BORDER_RADIUS = 15;
  const MIN_SIZE = 35;
  const CLICKTIME = 150;

  const drawCrosshair = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(mousePosition.x, 0);
    ctx.lineTo(mousePosition.x, canvasRef.current?.height || 0);
    ctx.stroke();
    // X-axis
    ctx.beginPath();
    ctx.moveTo(0, mousePosition.y);
    ctx.lineTo(canvasRef.current?.width, mousePosition.y || 0);
    ctx.stroke();
  }, [mousePosition]);
  const drawRoundRect = useCallback((rect) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const {
      x,
      y,
      width,
      height,
      topLeftRadius,
      topRightRadius,
      bottomRightRadius,
      bottomLeftRadius,
    } = rect;
    const tl = topLeftRadius || 0;
    const tr = topRightRadius || 0;
    const br = bottomRightRadius || 0;
    const bl = bottomLeftRadius || 0;
    ctx.beginPath();
    // top left corner
    ctx.moveTo(x + tl, y);
    // top edge
    ctx.lineTo(x + width - tr, y);
    //top right corner
    if (tr > 0) {
      ctx.quadraticCurveTo(x + width, y, x + width, y + tr);
    } else {
      ctx.lineTo(x + width, y);
    }
    //right edge
    ctx.lineTo(x + width, y + height - br);
    //bottom right corner
    if (br > 0) {
      ctx.quadraticCurveTo(x + width, y + height, x + width - br, y + height);
    } else {
      ctx.lineTo(x + width, y + height);
    }
    //bottom edge
    ctx.lineTo(x + bl, y + height);
    //bottom left corner
    if (bl > 0) {
      ctx.quadraticCurveTo(x, y + height, x, y + height - bl);
    } else {
      ctx.lineTo(x, y + height);
    }
    //left edge
    ctx.lineTo(x, y + tl);
    //top left corner
    if (tl > 0) {
      ctx.quadraticCurveTo(x, y, x + tl, y);
    } else {
      ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = rect.fileColor;
    ctx.fill();
  }, []);
  const drawAll = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#99c2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //created a new tempRect created
    if (tempRect) {
      drawRoundRect(tempRect);
    }
    drawCrosshair();
  }, [drawCrosshair, tempRect, drawRoundRect]);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setMousePosition({
      x: canvas.width / 2,
      y: canvas.height / 2,
    });
    drawAll();
  }, []);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  const getMousePosition = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }
    const rect = canvas.getBoundingClientRect();
    // console.log(rect);
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleMouseMove = useCallback(
    (event) => {
      const { x, y } = getMousePosition(event);
      // console.log("henleMouseMove X", x);
      // console.log("henleMouseMove Y", y);
      setMousePosition({ x, y });
      const state = drawingStateRef.current;
      if (state.isDrawing) {
        state.hasMove = true;
        const width = x - state.startX;
        const height = y - state.startY;
        setTempRect({
          x: Math.min(state.startX, x),
          y: Math.min(state.startY, y),
          width: Math.abs(width),
          height: Math.abs(height),
          topLeftRadius: BORDER_RADIUS,
          topRightRadius: BORDER_RADIUS,
          bottomRightRadius: BORDER_RADIUS,
          bottomLeftRadius: BORDER_RADIUS,
          fileColor: state.fillColor,
        });
      }
    },
    [getMousePosition]
  );

  const handleMouseDown = useCallback(
    (event) => {
      const { x, y } = getMousePosition(event);
      const state = drawingStateRef.current;
      state.clickStartTime = Date.now();
      state.hasMove = false;
      state.isDrawing = true;
      state.startX = x;
      state.startY = y;
    },
    [getMousePosition]
  );

  const handleMouseUp = useCallback(
    (event) => {
      const { x, y } = getMousePosition(event);
      const state = drawingStateRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
      }
      if (state.isDrawing) {
        state.isDrawing = false;
        const width = x - state.startX;
        const height = y - state.startY;
        const newRect = {
          x: Math.min(state.startX, x),
          y: Math.min(state.startY, y),
          width: Math.abs(width),
          height: Math.abs(height),
          id: Date.now() + Math.random(),
          topLeftRadius: BORDER_RADIUS,
          topRightRadius: BORDER_RADIUS,
          bottomRightRadius: BORDER_RADIUS,
          bottomLeftRadius: BORDER_RADIUS,
          originalWidth: Math.abs(width),
          originalHeight: Math.abs(width),
          fillColor: state.fillColor,
        };
        setRectangles((prev) => [...prev, newRect]);
        const index = Math.floor(Math.random() * FILE_COLORS.length);
        state.fillColor = FILE_COLORS[index];
      }
      setTempRect(null);
    },
    [getMousePosition, FILE_COLORS]
  );
  return (
    <canvas
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      ref={canvasRef}
    />
  );
};

export default PathaoTask;
