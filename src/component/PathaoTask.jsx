import { useCallback, useEffect, useRef } from "react";

const PathaoTask = () => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const drawAll = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#99c2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawAll();
  }, []);
  return <canvas ref={canvasRef} />;
};

export default PathaoTask;
