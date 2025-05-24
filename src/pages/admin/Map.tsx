import React, { useEffect, useRef, useState } from "react";

interface Area {
  templateAreaId: number;
  name: string;
  vertices: { x: number; y: number }[];
  zone: string;
  fillColor: string;
  seatNumbers?: string[];
}

interface MapTemplate {
  templateId: number;
  name: string;
  mapWidth: number;
  mapHeight: number;
  areas: Area[];
}

const mockMapTemplate: MapTemplate = {
  templateId: 1,
  name: "SVG Theater Map",
  mapWidth: 1000,
  mapHeight: 1000,
  areas: [
    {
      templateAreaId: 1,
      name: "STAGE",
      vertices: [
        { x: 308.011, y: 205 },
        { x: 695.804, y: 205 },
        { x: 695.804, y: 377.352 },
        { x: 529.607, y: 377.352 },
        { x: 529.607, y: 564.324 },
        { x: 606.55, y: 564.324 },
        { x: 606.55, y: 648.961 },
        { x: 494.982, y: 648.961 },
        { x: 393.418, y: 648.961 },
        { x: 393.418, y: 564.324 },
        { x: 465.744, y: 564.324 },
        { x: 465.744, y: 377.352 },
        { x: 308.011, y: 377.352 },
        { x: 308.011, y: 205 },
      ],
      zone: "ZONE A",
      fillColor: "#000000",
    },
    {
      templateAreaId: 2,
      name: "LEFT SEATING",
      vertices: [
        { x: 228, y: 473 },
        { x: 437.17, y: 473 },
        { x: 437.17, y: 529.234 },
        { x: 364.114, y: 529.234 },
        { x: 364.114, y: 607.809 },
        { x: 364.114, y: 691.005 },
        { x: 491, y: 691.005 },
        { x: 491, y: 795 },
        { x: 228, y: 795 },
        { x: 228, y: 691.005 },
        { x: 228, y: 473 },
      ],
      zone: "ZONE A",
      fillColor: "#FB3E49",
    },
    {
      templateAreaId: 3,
      name: "RIGHT SEATING",
      vertices: [
        { x: 772, y: 471 },
        { x: 562.83, y: 471 },
        { x: 562.83, y: 527.234 },
        { x: 635.886, y: 527.234 },
        { x: 635.886, y: 605.809 },
        { x: 635.886, y: 689.005 },
        { x: 509, y: 689.005 },
        { x: 509, y: 793 },
        { x: 772, y: 793 },
        { x: 772, y: 689.005 },
        { x: 772, y: 471 },
      ],
      zone: "ZONE A",
      fillColor: "#FB3E49",
    },

  ],
};

const FigmaMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pathsRef = useRef<Map<number, Path2D>>(new Map());
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null);
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [startY, setStartY] = useState<number>(0);

  const drawCanvas = (ctx: CanvasRenderingContext2D) => {
    const mapTemplate = mockMapTemplate;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Apply scaling and translation
    ctx.save();
    ctx.scale(scale, scale);
    ctx.translate(offsetX, offsetY);

    // Draw Background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, mapTemplate.mapWidth / scale, mapTemplate.mapHeight / scale);

    // Draw Areas and Store Paths for Click Detection
    pathsRef.current.clear();
    mapTemplate.areas.forEach((area) => {
      const path = new Path2D();
      path.moveTo(area.vertices[0].x, area.vertices[0].y);

      for (let i = 1; i < area.vertices.length; i++) {
        path.lineTo(area.vertices[i].x, area.vertices[i].y);
      }
      path.closePath();

      // Store the path for click detection (adjusted for offset)
      pathsRef.current.set(area.templateAreaId, path);

      // Draw the area
      ctx.beginPath();
      ctx.moveTo(area.vertices[0].x, area.vertices[0].y);
      for (let i = 1; i < area.vertices.length; i++) {
        ctx.lineTo(area.vertices[i].x, area.vertices[i].y);
      }
      ctx.closePath();

      // Apply fill color based on selection
      if (selectedAreaId === area.templateAreaId && area.name !== "STAGE") {
        ctx.fillStyle = "#FF5733"; // Orange for selected seating areas
      } else {
        ctx.fillStyle = area.fillColor;
      }
      ctx.fill();

      // Draw stroke, bold for selected STAGE
      if (area.name === "STAGE") {
        ctx.strokeStyle = "#000000"; // Black border
        ctx.lineWidth = selectedAreaId === area.templateAreaId ? 5 / scale : 2 / scale;
        ctx.stroke();
      } else {
        ctx.lineWidth = 0; // No border for other areas
      }

      // Add area name label
      ctx.fillStyle = "black";
      ctx.font = `${12 / scale}px Arial`; // Scale the font size
      ctx.textAlign = "left";
      ctx.fillText(
        area.name,
        area.vertices[0].x + 5 / scale,
        area.vertices[0].y + 15 / scale
      );
    });

    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (canvas && ctx) {
      const mapTemplate = mockMapTemplate;
      canvas.width = mapTemplate.mapWidth;
      canvas.height = mapTemplate.mapHeight;

      // Draw on scale change, selection, or offset change
      drawCanvas(ctx);

      // Add drag and click event listeners
      const handleMouseDown = (event: MouseEvent) => {
        setIsDragging(true);
        setStartX(event.clientX - offsetX * scale);
        setStartY(event.clientY - offsetY * scale);
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (isDragging) {
          const newOffsetX = (event.clientX - startX) / scale;
          const newOffsetY = (event.clientY - startY) / scale;
          setOffsetX(newOffsetX);
          setOffsetY(newOffsetY);
          drawCanvas(ctx);
        }
      };

      const handleMouseUp = () => {
        setIsDragging(false);
      };

      const handleClick = (event: MouseEvent) => {
        if (!isDragging) {
          const rect = canvas.getBoundingClientRect();
          const x = (event.clientX - rect.left - offsetX * scale) / scale;
          const y = (event.clientY - rect.top - offsetY * scale) / scale;

          for (const [areaId, path] of pathsRef.current.entries()) {
            if (ctx.isPointInPath(path, x, y, "nonzero")) {
              const area = mapTemplate.areas.find(
                (a) => a.templateAreaId === areaId
              );
              if (area) {
                alert(`Successfully clicked on ${area.name}!`);
                setSelectedAreaId(areaId === selectedAreaId ? null : areaId); // Toggle selection
                drawCanvas(ctx); // Re-render to update color or border
                break;
              }
            }
          }
        }
      };

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("click", handleClick);

      // Cleanup event listeners on unmount
      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("click", handleClick);
      };
    }
  }, [selectedAreaId, scale, offsetX, offsetY]);

  const handleZoomIn = () => {
    setScale((prevScale) => Math.min(prevScale + 0.1, 2)); // Max zoom 2x
  };

  const handleZoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.1, 0.5)); // Min zoom 0.5x
  };

  const handleReset = () => {
    setScale(1); // Reset to original size
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">SVG Map</h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleZoomIn}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zoom In
        </button>
        <button
          onClick={handleZoomOut}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Zoom Out
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Reset
        </button>
      </div>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <canvas ref={canvasRef} className="border border-gray-300" />
      </div>
    </div>
  );
};

export default FigmaMap;