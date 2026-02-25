"use client";
import React from "react";
import {
  Pencil, Square, Circle, ArrowUpRight,
  Eraser, Type, Undo2, Redo2, MousePointer2, Minus
} from "lucide-react";

export default function Toolbar({
  currentTool, setTool, strokeColor, setStrokeColor,
  strokeWidth, setStrokeWidth, onUndo, onRedo, canUndo, canRedo
}) {
  const tools = [
    { id: "select", icon: MousePointer2 },
    { id: "pen", icon: Pencil },
    { id: "line", icon: Minus },
    { id: "rect", icon: Square },
    { id: "circle", icon: Circle },
    { id: "arrow", icon: ArrowUpRight },
    { id: "text", icon: Type },
    { id: "eraser", icon: Eraser },
  ];

  const toolbarStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#ffffff",
    padding: "6px 12px",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
    height: "48px",
    fontSize: "14px",
  };

  const sectionDividerStyle = {
    width: "1px",
    height: "24px",
    backgroundColor: "#e5e7eb",
  };

  const undoRedoButtonStyle = (disabled) => ({
    padding: "6px",
    borderRadius: "8px",
    cursor: disabled ? "not-allowed" : "pointer",
    color: "#16a34a",
    backgroundColor: "#f4f7f4",
    border: "none",
    outline: "none",
    opacity: disabled ? 0.4 : 1,
    transition: "all 0.2s",
  });

  const toolButtonStyle = (selected) => ({
    padding: "6px",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: selected ? "#15803d" : "#f4f7f4",
    color: selected ? "#ffffff" : "#16a34a",
    border: selected ? "2px solid #15803d" : "2px solid transparent",
    transition: "all 0.2s",
  });

  const inputStyle = {
    width: "28px",
    height: "28px",
    cursor: "pointer",
    borderRadius: "6px",
    border: "1px solid #e5e7eb",
    backgroundColor: "#f4f7f4",
  };

  const rangeStyle = {
    width: "70px",
    cursor: "pointer",
  };

  return (
    <div style={toolbarStyle}>
      {/* Undo / Redo */}
      <div style={{ display: "flex", gap: "6px" }}>
        <button
          style={undoRedoButtonStyle(!canUndo)}
          onClick={onUndo}
          disabled={!canUndo}
        >
          <Undo2 size={18} />
        </button>
        <button
          style={undoRedoButtonStyle(!canRedo)}
          onClick={onRedo}
          disabled={!canRedo}
        >
          <Redo2 size={18} />
        </button>
      </div>

      {/* Divider */}
      <div style={sectionDividerStyle} />

      {/* Tools */}
      <div style={{ display: "flex", gap: "6px" }}>
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => setTool(t.id)}
            title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
            style={toolButtonStyle(currentTool === t.id)}
          >
            <t.icon size={18} />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={sectionDividerStyle} />

      {/* Color + Width */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          style={inputStyle}
        />
        <input
          type="range"
          min="1"
          max="15"
          value={strokeWidth}
          onChange={(e) => setStrokeWidth(+e.target.value)}
          style={rangeStyle}
        />
      </div>
    </div>
  );
}
