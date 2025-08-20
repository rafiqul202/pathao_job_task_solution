import { useCallback, useEffect, useRef, useState } from "react";

const PathaoTask = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
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
  }, [drawAll]);
  return <canvas ref={canvasRef} />;
};

export default PathaoTask;
