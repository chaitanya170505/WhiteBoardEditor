"use client";
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Stage, Layer, Line, Rect, Circle, Arrow, Text } from "react-konva";

const Whiteboard = forwardRef(
  (
    {
      currentTool,
      strokeColor,
      strokeWidth,
      bgFill,
      shapes,
      setShapes,
      onActionStart,
      isPremium,
    },
    ref,
  ) => {
    const stageRef = useRef(null);
    const containerRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const [pointerPos, setPointerPos] = useState(null);

    /* -------------------- Detect Dark Background -------------------- */
    const isDarkBackground = (color) => {
      if (!color) return false;
      const hex = color.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness < 128;
    };

    /* -------------------- Cursor Logic -------------------- */
    const getCursorStyle = () => {
      switch (currentTool) {
        case "select":
          return "move";
        case "eraser":
        case "pen":
          return "none";
        case "text":
          return "text";
        case "rect":
        case "circle":
        case "line":
        case "arrow":
          return "crosshair";
        default:
          return "default";
      }
    };

    /* -------------------- Resize Handling -------------------- */
    useEffect(() => {
      const checkSize = () => {
        if (containerRef.current) {
          setDimensions({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
          });
        }
      };

      const resizeObserver = new ResizeObserver(checkSize);
      if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
      }

      checkSize();
      return () => resizeObserver.disconnect();
    }, []);

    /* -------------------- Download PNG -------------------- */
    useImperativeHandle(ref, () => ({
      download: (fileName = `whiteboard-${Date.now()}.png`) => {
        if (!stageRef.current) return;

        const dataURL = stageRef.current.toDataURL({
          pixelRatio: 2,
          backgroundColor: bgFill,
        });

        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    }));

    /* -------------------- Drawing Handlers -------------------- */
    const handlePointerDown = (e) => {
      const stage = e.target.getStage();
      const pos = stage.getPointerPosition();
      if (!pos) return;

      setPointerPos(pos);
      if (currentTool === "select") return;

      onActionStart?.();

      if (currentTool === "text" && e.target.name() === "background") {
        const textInput = prompt("Enter text:");
        if (!textInput) return;

        setShapes([
          ...shapes,
          {
            id: `shape-${Date.now()}`,
            tool: "text",
            x: pos.x,
            y: pos.y,
            text: textInput,
            fontSize: 24,
            color: strokeColor,
          },
        ]);
        return;
      }

      setIsDrawing(true);

      setShapes([
        ...shapes,
        {
          id: `shape-${Date.now()}`,
          tool: currentTool,
          points: [pos.x, pos.y, pos.x, pos.y],
          color: currentTool === "eraser" ? bgFill : strokeColor,
          strokeWidth:
            currentTool === "eraser" ? strokeWidth * 6 : strokeWidth,
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
        },
      ]);
    };

    const handlePointerMove = (e) => {
      const stage = e.target.getStage();
      const point = stage.getPointerPosition();
      if (!point) return;

      setPointerPos(point);
      if (!isDrawing) return;

      const updatedShapes = shapes.map((s, i) => {
        if (i !== shapes.length - 1) return s;
        const lastShape = { ...s };

        if (currentTool === "pen" || currentTool === "eraser") {
          lastShape.points = lastShape.points.concat([point.x, point.y]);
        } else if (currentTool === "line" || currentTool === "arrow") {
          lastShape.points = [lastShape.x, lastShape.y, point.x, point.y];
        } else if (currentTool === "rect" || currentTool === "circle") {
          lastShape.width = point.x - lastShape.x;
          lastShape.height = point.y - lastShape.y;
        }

        return lastShape;
      });

      setShapes(updatedShapes);
    };

    const handlePointerUp = () => setIsDrawing(false);

    const handleTextDrag = (e, id) =>
      setShapes(
        shapes.map((s) =>
          s.id === id ? { ...s, x: e.target.x(), y: e.target.y() } : s,
        ),
      );

    /* -------------------- Render -------------------- */
    return (
      <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
        <div
          ref={containerRef}
          className="w-full h-full relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-300"
          style={{
            backgroundColor: bgFill,
            cursor: getCursorStyle(),
          }}
        >
          <Stage
            width={dimensions.width}
            height={dimensions.height}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            ref={stageRef}
          >
            <Layer>
              {/* Background */}
              <Rect
                x={0}
                y={0}
                width={dimensions.width}
                height={dimensions.height}
                fill={bgFill}
                name="background"
              />

              {/* Watermark */}
              {!isPremium && (
                <Text
                  x={dimensions.width / 2}
                  y={dimensions.height / 2}
                  text="ManoRekha Free Version"
                  fontSize={dimensions.width > 500 ? 40 : 20}
                  fontFamily="Arial"
                  fill={isDarkBackground(bgFill) ? "#ffffff" : "#000000"}
                  opacity={0.2}
                  align="center"
                  verticalAlign="middle"
                  offsetX={dimensions.width > 500 ? 200 : 100}
                  listening={false}
                  rotation={-30}
                />
              )}

              {/* Shapes */}
              {shapes.map((shape) => {
                const commonProps = {
                  stroke: shape.color,
                  strokeWidth: shape.strokeWidth,
                  draggable:
                    currentTool === "select" && shape.tool !== "text",
                  lineCap: "round",
                  lineJoin: "round",
                };

                if (shape.tool === "pen" || shape.tool === "eraser")
                  return (
                    <Line
                      key={shape.id}
                      {...commonProps}
                      points={shape.points}
                      tension={0.5}
                    />
                  );

                if (shape.tool === "line")
                  return (
                    <Line
                      key={shape.id}
                      {...commonProps}
                      points={shape.points}
                    />
                  );

                if (shape.tool === "rect")
                  return (
                    <Rect
                      key={shape.id}
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                      width={shape.width}
                      height={shape.height}
                    />
                  );

                if (shape.tool === "circle")
                  return (
                    <Circle
                      key={shape.id}
                      {...commonProps}
                      x={shape.x}
                      y={shape.y}
                      radius={Math.sqrt(
                        shape.width ** 2 + shape.height ** 2,
                      )}
                    />
                  );

                if (shape.tool === "arrow")
                  return (
                    <Arrow
                      key={shape.id}
                      {...commonProps}
                      points={shape.points}
                      fill={shape.color}
                      pointerLength={10}
                      pointerWidth={10}
                    />
                  );

                if (shape.tool === "text")
                  return (
                    <Text
                      key={shape.id}
                      x={shape.x}
                      y={shape.y}
                      text={shape.text}
                      fontSize={shape.fontSize}
                      fill={shape.color}
                      draggable
                      onDragEnd={(e) => handleTextDrag(e, shape.id)}
                    />
                  );

                return null;
              })}

              {/* Brush / Eraser Preview */}
              {pointerPos &&
                (currentTool === "pen" || currentTool === "eraser") && (
                  <Circle
                    x={pointerPos.x}
                    y={pointerPos.y}
                    radius={
                      currentTool === "eraser"
                        ? (strokeWidth * 6) / 2
                        : strokeWidth / 2
                    }
                    fill={
                      currentTool === "eraser"
                        ? bgFill
                        : strokeColor
                    }
                    stroke="#374151"
                    strokeWidth={1}
                    opacity={0.8}
                    listening={false}
                  />
                )}
            </Layer>
          </Stage>
        </div>
      </div>
    );
  },
);

export default Whiteboard;