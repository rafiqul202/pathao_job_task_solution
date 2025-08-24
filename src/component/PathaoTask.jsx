import React, { useCallback, useEffect, useRef, useState } from "react";

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
    hasMoved: false,
    fillColor: "gray",
  });

  const [rectangles, setRectangles] = useState([]);
  const [tempRect, setTempRect] = useState(null);
  const FILE_COLORS = ["#95eda7", "#ede695", "#919df2", "#f291f1"];
  const BORDER_RADIUS = 15;
  const MIN_SIZE = 35;
  const CLICKTIME = 150;

  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const drawCrosshair = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1;
    //y-axis
    ctx.beginPath();
    ctx.moveTo(mousePos.x, 0);
    ctx.lineTo(mousePos.x, canvasRef.current?.height || 0);
    ctx.stroke();
    //x-axis
    ctx.beginPath();
    ctx.moveTo(0, mousePos.y);
    ctx.lineTo(canvasRef.current?.width, mousePos.y || 0);
    ctx.stroke();
  }, [mousePos]);

  const getRectAt = useCallback(
    (x, y) => {
      for (let i = rectangles.length - 1; i >= 0; i--) {
        const r = rectangles[i];
        if (x > r.x && x <= r.x + r.width && y > r.y && y <= r.y + r.height) {
          return r;
        }
      }
      return null;
    },
    [rectangles]
  );

  const drawRoundedRect = useCallback((rect) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const { x, y, width, height } = rect;
    const tl = rect.topLeftRadius || 0;
    const tr = rect.topRightRadius || 0;
    const bl = rect.bottomLeftRadius || 0;
    const br = rect.bottomRightRadius || 0;
    ctx.beginPath();
    //top left corner
    ctx.moveTo(x + tl, y);
    //top edge
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
    ctx.fillStyle = rect.fillColor;
    ctx.fill();
  }, []);

  const drawAll = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#99c2ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    rectangles.forEach((r) => drawRoundedRect(r));
    if (tempRect) {
      drawRoundedRect(tempRect);
    }
    drawCrosshair();
  }, [drawCrosshair, tempRect, rectangles, drawRoundedRect]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctxRef.current = ctx;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    setMousePos({
      x: canvas.width / 2,
      y: canvas.height / 2,
    });
    drawAll();
  }, []);

  useEffect(() => {
    drawAll();
  }, [drawAll]);

  const getMousePos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        x: 0,
        y: 0,
      };
    }
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const shouldCutRect = useCallback((rect, crosshairX, crosshairY) => {
    const verticalIntersects =
      crosshairX > rect.x && crosshairX < rect.x + rect.width;
    const horizontalIntersects =
      crosshairY > rect.y && crosshairY < rect.y + rect.height;
    return verticalIntersects || horizontalIntersects;
  }, []);

  const cutRect = useCallback((rect, crosshairX, crosshairY) => {
    const { x, y, width, height, originalWidth, originalHeight, fillColor } =
      rect;
    const rightEdge = x + width;
    const bottomEdge = y + height;
    const newRects = [];
    const verticalIntersects = crosshairX > x && crosshairX < rightEdge;
    const horizontalIntersects = crosshairY > rect.y && crosshairY < bottomEdge;

    if (verticalIntersects && horizontalIntersects) {
      //top-left
      if (crosshairX - x > 1 && crosshairY - y > 1) {
        newRects.push({
          x,
          y,
          width: crosshairX - x,
          height: crosshairY - y,
          id: Date.now() + Math.random(),
          topLeftRadius: rect.topLeftRadius,
          topRightRadius: 0,
          bottomRightRadius: 0,
          bottomLeftRadius: 0,
          originalHeight,
          originalWidth,
          fillColor,
        });
      }
      //top-right
      if (rightEdge - crosshairX > 1 && crosshairY - y > 1) {
        newRects.push({
          x: crosshairX,
          y,
          width: rightEdge - crosshairX,
          height: crosshairY - y,
          id: Date.now() + Math.random(),
          topLeftRadius: 0,
          topRightRadius: rect.topRightRadius,
          bottomRightRadius: 0,
          bottomLeftRadius: 0,
          originalHeight,
          originalWidth,
          fillColor,
        });
      }
      //bottom-left
      if (crosshairX - x > 1 && bottomEdge - crosshairY > 1) {
        newRects.push({
          x: x,
          y: crosshairY,
          width: crosshairX - x,
          height: bottomEdge - crosshairY,
          id: Date.now() + Math.random(),
          topLeftRadius: 0,
          topRightRadius: 0,
          bottomRightRadius: 0,
          bottomLeftRadius: rect.bottomLeftRadius,
          originalHeight,
          originalWidth,
          fillColor,
        });
      }
      //bottom-right
      if (rightEdge - crosshairX > 1 && bottomEdge - crosshairY > 1) {
        newRects.push({
          x: crosshairX,
          y: crosshairY,
          width: rightEdge - crosshairX,
          height: bottomEdge - crosshairY,
          id: Date.now() + Math.random(),
          topLeftRadius: 0,
          topRightRadius: 0,
          bottomRightRadius: rect.bottomRightRadius,
          bottomLeftRadius: 0,
          originalHeight,
          originalWidth,
          fillColor,
        });
      }
    } else if (verticalIntersects) {
      //left rect
      if (crosshairX - x > 1) {
        newRects.push({
          x: x,
          y: y,
          width: crosshairX - x,
          height: height,
          id: Date.now() + Math.random(),
          topLeftRadius: rect.topLeftRadius,
          topRightRadius: 0,
          bottomRightRadius: 0,
          bottomLeftRadius: rect.bottomLeftRadius,
          originalHeight,
          originalWidth,
          fillColor,
        });
      }
      //right rect
      if (rightEdge - crosshairX > 1) {
        newRects.push({
          x: crosshairX,
          y: y,
          width: rightEdge - crosshairX,
          height: height,
          id: Date.now() + Math.random(),
          topLeftRadius: 0,
          topRightRadius: rect.topRightRadius,
          bottomRightRadius: rect.bottomRightRadius,
          bottomLeftRadius: 0,
          originalHeight,
          originalWidth,
          fillColor,
        });
      }
    } else if (horizontalIntersects) {
      //top rect
      if (crosshairY - y > 1) {
        newRects.push({
          x: x,
          y: y,
          width: width,
          height: crosshairY - y,
          id: Date.now() + Math.random(),
          topLeftRadius: rect.topLeftRadius,
          topRightRadius: rect.topRightRadius,
          bottomRightRadius: 0,
          bottomLeftRadius: 0,
          originalHeight,
          originalWidth,
          fillColor,
        });
      }
      //bottom rect
      if (bottomEdge - crosshairY > 1) {
        newRects.push({
          x: x,
          y: crosshairY,
          width: width,
          height: bottomEdge - crosshairY,
          id: Date.now() + Math.random(),
          topLeftRadius: 0,
          topRightRadius: 0,
          bottomRightRadius: rect.bottomRightRadius,
          bottomLeftRadius: rect.bottomLeftRadius,
          originalHeight,
          originalWidth,
          fillColor,
        });
      }
    }
    return newRects;
  }, []);

  const isAboveMinSize = useCallback((rect, selectRect, startX) => {
    let { width, height } = rect;
    if (width > MIN_SIZE && height > MIN_SIZE) {
      return true;
    } else {
      if (width < MIN_SIZE && height > MIN_SIZE + 5) {
        return true;
      } else if (height < MIN_SIZE && width > MIN_SIZE + 5) {
        return true;
      } else {
        if (selectRect && selectRect?.id === rect?.id && startX) {
          setRectangles((preR) => {
            let index = preR.findIndex((r) => r.id === rect?.id);
            if (index > -1) {
              let moveX = startX - rect.x;
              let mx = rect.x + moveX;
              preR[index].x = mx;
              return [...preR];
            } else {
              return preR;
            }
          });
        }
      }
    }
  }, []);

  const cutALlInterRects = useCallback(
    (crosshairX, crosshairY, selectRect, startX) => {
      setRectangles((prevR) => {
        const rectsToCut = prevR.filter(
          (rect) =>
            shouldCutRect(rect, crosshairX, crosshairY) &&
            isAboveMinSize(rect, selectRect, startX)
        );
        if (rectsToCut.length === 0) {
          return prevR;
        }
        let newRects = [...prevR];
        rectsToCut.forEach((rect) => {
          const index = newRects.findIndex((r) => r.id === rect.id);
          if (index > -1) {
            const cutRects = cutRect(rect, crosshairX, crosshairY);
            newRects.splice(index, 1, ...cutRects);
          }
        });
        return newRects;
      });
    },
    [shouldCutRect, cutRect, isAboveMinSize]
  );

  const handleMouseMove = useCallback(
    (e) => {
      const { x, y } = getMousePos(e);
      setMousePos({ x, y });
      const state = drawingStateRef.current;
      if (state.isDragging && state.selectRect) {
        setRectangles((preR) =>
          preR.map((rect) =>
            rect?.id === state.selectRect?.id
              ? { ...rect, x: x - state.dragOffsetX, y: y - state.dragOffsetY }
              : rect
          )
        );
        state.hasMoved = true;
      } else if (state.isDrawing) {
        state.hasMoved = true;
        const width = x - state.startX;
        const height = y - state.startY;
        setTempRect({
          x: Math.min(state.startX, x),
          y: Math.min(state.startY, y),
          width: Math.abs(width),
          height: Math.abs(height),
          topLeftRadius: BORDER_RADIUS,
          topRightRadius: BORDER_RADIUS,
          bottomLeftRadius: BORDER_RADIUS,
          bottomRightRadius: BORDER_RADIUS,
          fillColor: state.fillColor,
        });
      }
    },
    [getMousePos]
  );

  const handleMouseDown = useCallback(
    (e) => {
      const { x, y } = getMousePos(e);
      const rect = getRectAt(x, y);
      const state = drawingStateRef.current;
      state.clickStartTime = Date.now();
      state.hasMoved = false;
      if (rect) {
        state.isDragging = true;
        state.selectRect = rect;
        state.dragOffsetX = x - rect.x;
        state.dragOffsetY = y - rect.y;

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.style.cursor = "grabbing";
        }
      } else {
        state.isDrawing = true;
        state.startX = x;
        state.startY = y;
      }
    },
    [getMousePos, getRectAt]
  );
  const handleMouseUp = useCallback(
    (e) => {
      const { x, y } = getMousePos(e);
      const state = drawingStateRef.current;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.style.cursor = "crosshair";
      }
      if (state.isDragging) {
        const clickDuration = Date.now() - state.clickStartTime;
        const check = clickDuration < CLICKTIME && !state.hasMoved;
        if (check) {
          cutALlInterRects(mousePos.x, mousePos.y, state.selectRect, x);
        }
        state.isDragging = false;
        state.selectRect = null;
      }

      if (state.isDrawing) {
        state.isDrawing = false;
        const clickDuration = Date.now() - state.clickStartTime;
        const check = clickDuration < CLICKTIME && !state.hasMoved;
        if (check) {
          cutALlInterRects(mousePos.x, mousePos.y, state.selectRect, x);
        } else {
          const width = x - state.startX;
          const height = y - state.startY;

          const check = isAboveMinSize({ width, height });
          if (check) {
            const newRect = {
              x: Math.min(state.startX, x),
              y: Math.min(state.startY, y),
              width: Math.abs(width),
              height: Math.abs(height),
              id: Date.now() + Math.random(),
              topLeftRadius: BORDER_RADIUS,
              topRightRadius: BORDER_RADIUS,
              bottomLeftRadius: BORDER_RADIUS,
              bottomRightRadius: BORDER_RADIUS,
              originalWidth: Math.abs(width),
              originalHeight: Math.abs(width),
              fillColor: state.fillColor,
            };
            setRectangles((prev) => [...prev, newRect]);
          }

          const index = Math.floor(Math.random() * FILE_COLORS.length);
          state.fillColor = FILE_COLORS[index];
        }
      }
      setTempRect(null);
    },
    [getMousePos, mousePos]
  );

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      drawAll();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rectangles]);

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
