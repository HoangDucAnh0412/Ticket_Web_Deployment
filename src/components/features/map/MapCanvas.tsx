import React, { useEffect, useRef } from "react";

interface Vertex {
  x: number;
  y: number;
}

interface Area {
  templateAreaId: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vertices: Vertex[];
  zone: string;
  fillColor: string;
  isStage?: boolean;
}

interface MapTemplate {
  templateId: number;
  name: string;
  description: string;
  areaCount: number;
  mapWidth: number;
  mapHeight: number;
  areas: Area[];
}

interface MapCanvasProps {
  template: MapTemplate;
  selectedAreaIds?: number[];
  maxSize?: number;
  showLabels?: boolean;
  className?: string;
}

const MapCanvas: React.FC<MapCanvasProps> = ({
  template,
  selectedAreaIds = [],
  maxSize = 800,
  showLabels = true,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!template || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate scale to fit the canvas
    const scale = Math.min(
      maxSize / template.mapWidth,
      maxSize / template.mapHeight
    );
    canvas.width = template.mapWidth * scale;
    canvas.height = template.mapHeight * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map outline
    ctx.strokeStyle = "#2d3748";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Sort areas to ensure OUTER BOUNDARY is drawn first
    const sortedAreas = [...template.areas].sort((a, b) => {
      if (a.name.toUpperCase() === "OUTER BOUNDARY") return -1;
      if (b.name.toUpperCase() === "OUTER BOUNDARY") return 1;
      return 0;
    });

    // Draw areas
    sortedAreas.forEach((area) => {
      if (area.vertices && area.vertices.length > 0) {
        ctx.beginPath();
        ctx.moveTo(area.vertices[0].x * scale, area.vertices[0].y * scale);
        for (let i = 1; i < area.vertices.length; i++) {
          ctx.lineTo(area.vertices[i].x * scale, area.vertices[i].y * scale);
        }
        ctx.closePath();

        // Check if this area is selected
        const isSelected = selectedAreaIds.includes(area.templateAreaId);

        // Set colors based on selection state
        if (isSelected) {
          ctx.fillStyle = "#fbbf24"; // Bright yellow for selected areas
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 3;
        } else {
          ctx.fillStyle = area.fillColor || "#e2e8f0";
          ctx.strokeStyle = "#4a5568";
          ctx.lineWidth = 2;
        }
        ctx.fill();
        ctx.stroke();

        // Draw labels if enabled
        if (showLabels && area.vertices.length > 2) {
          // Calculate centroid
          let cx = 0,
            cy = 0,
            areaSum = 0;
          for (let i = 0; i < area.vertices.length; i++) {
            const j = (i + 1) % area.vertices.length;
            const cross =
              area.vertices[i].x * area.vertices[j].y -
              area.vertices[j].x * area.vertices[i].y;
            areaSum += cross;
            cx += (area.vertices[i].x + area.vertices[j].x) * cross;
            cy += (area.vertices[i].y + area.vertices[j].y) * cross;
          }
          areaSum *= 0.5;
          cx = (cx / (6 * areaSum)) * scale;
          cy = (cy / (6 * areaSum)) * scale;

          // Calculate bounding box
          let minX = Math.min(...area.vertices.map((v) => v.x)) * scale;
          let maxX = Math.max(...area.vertices.map((v) => v.x)) * scale;
          let minY = Math.min(...area.vertices.map((v) => v.y)) * scale;
          let maxY = Math.max(...area.vertices.map((v) => v.y)) * scale;

          const areaWidth = maxX - minX;
          const areaHeight = maxY - minY;

          // Calculate font size
          const textWidth = ctx.measureText(area.name).width;
          const maxFontSize = Math.min(
            Math.floor((areaWidth * 0.7) / (area.name.length * 0.5)),
            Math.floor(areaHeight * 0.3),
            20
          );
          const fontSize = Math.max(10, maxFontSize);

          ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Split text into words and display each word on a new line
          const nameWords = area.name.trim().split(/\s+/);
          const lineHeight = fontSize + 2;
          const totalHeight = (nameWords.length - 1) * lineHeight;

          // Only draw text if area is large enough
          if (areaWidth > 30 && areaHeight > 20) {
            nameWords.forEach((word, idx) => {
              // Text shadow
              ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
              ctx.fillText(
                word,
                cx + 1,
                cy - totalHeight / 2 + idx * lineHeight + 1
              );

              // Main text
              ctx.fillStyle = "#1a202c";
              ctx.fillText(word, cx, cy - totalHeight / 2 + idx * lineHeight);
            });
          }
        }
      }
    });
  }, [template, selectedAreaIds, maxSize, showLabels]);

  return (
    <canvas
      ref={canvasRef}
      className={`border border-gray-300 rounded-lg shadow-md ${className}`}
      style={{
        maxWidth: "100%",
        maxHeight: "800px",
        minHeight: "400px",
      }}
    />
  );
};

export default MapCanvas;
