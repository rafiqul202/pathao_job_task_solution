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
    fillColor : "gray"
  })
  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

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

  const drawAll = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#99c2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawCrosshair();
  }, [drawCrosshair]);
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
    },
    [getMousePosition]
  );
  return <canvas onMouseMove={handleMouseMove} ref={canvasRef} />;
};

export default PathaoTask;
