import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

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

interface EventArea {
  areaId: number;
  name: string;
  price: number;
  templateAreaId: number;
}

interface MapVisualProps {
  eventId: string;
  mapTemplateId: number;
}

const MapVisual: React.FC<MapVisualProps> = ({ eventId, mapTemplateId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mapTemplate, setMapTemplate] = useState<MapTemplate | null>(null);
  const [eventAreas, setEventAreas] = useState<EventArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [templateRes, areasRes] = await Promise.all([
          axios.get<MapTemplate>(
            `http://localhost:8085/api/admin/map-templates/${mapTemplateId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<{ data: EventArea[] }>(
            `http://localhost:8085/api/admin/events/${eventId}/areas`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setMapTemplate(templateRes.data);
        setEventAreas(areasRes.data.data);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, mapTemplateId]);

  const drawMap = () => {
    if (!mapTemplate || !canvasRef.current || eventAreas.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Calculate scale to fit the canvas
    const scale = Math.min(
      800 / mapTemplate.mapWidth,
      800 / mapTemplate.mapHeight
    );
    canvas.width = mapTemplate.mapWidth * scale;
    canvas.height = mapTemplate.mapHeight * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map outline
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Filter template areas to only show those that exist in event areas
    const eventAreaIds = eventAreas.map((area) => area.templateAreaId);
    const relevantAreas = mapTemplate.areas.filter((area) =>
      eventAreaIds.includes(area.templateAreaId)
    );

    // Draw areas
    relevantAreas.forEach((area) => {
      if (area.vertices && area.vertices.length > 0) {
        ctx.beginPath();
        ctx.moveTo(area.vertices[0].x * scale, area.vertices[0].y * scale);
        for (let i = 1; i < area.vertices.length; i++) {
          ctx.lineTo(area.vertices[i].x * scale, area.vertices[i].y * scale);
        }
        ctx.closePath();
        ctx.fillStyle = area.fillColor;
        ctx.fill();
        ctx.strokeStyle = "black";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Calculate centroid for label placement
        let cx = 0,
          cy = 0,
          areaSum = 0;
        for (let i = 0, len = area.vertices.length; i < len; i++) {
          const v1 = area.vertices[i];
          const v2 = area.vertices[(i + 1) % len];
          const a = v1.x * v2.y - v2.x * v1.y;
          areaSum += a;
          cx += (v1.x + v2.x) * a;
          cy += (v1.y + v2.y) * a;
        }
        areaSum *= 0.5;
        cx = (cx / (6 * areaSum)) * scale;
        cy = (cy / (6 * areaSum)) * scale;

        // Find the two vertices with the largest horizontal distance
        let maxHorzDist = 0,
          horzV1 = area.vertices[0],
          horzV2 = area.vertices[0];
        for (let i = 0; i < area.vertices.length; i++) {
          for (let j = i + 1; j < area.vertices.length; j++) {
            const horzDist = Math.abs(area.vertices[i].x - area.vertices[j].x);
            if (horzDist > maxHorzDist) {
              maxHorzDist = horzDist;
              horzV1 = area.vertices[i];
              horzV2 = area.vertices[j];
            }
          }
        }

        // Determine label position
        let labelX, labelY;
        const eventArea = eventAreas.find(
          (ea) => ea.templateAreaId === area.templateAreaId
        );
        if (eventArea && eventArea.name.trim().toLowerCase() === "stage") {
          labelX = ((horzV1.x + horzV2.x) / 2) * scale;
          labelY = ((horzV1.y + horzV2.y) / 2) * scale;
        } else {
          labelX = cx;
          labelY = cy;
        }

        // Draw area name
        const displayName = eventArea ? eventArea.name : area.name;
        const nameWords = displayName.trim().split(/\s+/);
        ctx.fillStyle = "white";
        ctx.font = "bold 9px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lineHeight = 10;
        const totalHeight = (nameWords.length - 1) * lineHeight;
        nameWords.forEach((word, idx) => {
          ctx.fillText(
            word,
            labelX,
            labelY - totalHeight / 2 + idx * lineHeight
          );
        });
      }
    });
  };

  // Effect to draw map when data is loaded or when opened
  useEffect(() => {
    if (isOpen && mapTemplate && eventAreas.length > 0) {
      // Small delay to ensure the canvas is visible
      setTimeout(drawMap, 100);
    }
  }, [isOpen, mapTemplate, eventAreas]);

  if (loading) {
    return <div className="p-4 text-center">Loading map...</div>;
  }

  if (!mapTemplate) {
    return (
      <div className="p-4 text-center text-red-500">Map template not found</div>
    );
  }

  // Get unique zones from relevant areas
  const relevantAreas = mapTemplate.areas.filter((area) =>
    eventAreas.some((ea) => ea.templateAreaId === area.templateAreaId)
  );
  const uniqueZones = relevantAreas.filter(
    (area, index, self) =>
      index === self.findIndex((a) => a.fillColor === area.fillColor)
  );

  // Count unique areas based on name and price (only count areas with price > 0)
  const uniqueAreas = eventAreas.reduce((acc, area) => {
    if (area.price > 0) {
      const key = `${area.name}_${area.price}`;
      if (!acc[key]) {
        acc[key] = {
          name: area.name,
          price: area.price,
          count: 1,
        };
      } else {
        acc[key].count++;
      }
    }
    return acc;
  }, {} as Record<string, { name: string; price: number; count: number }>);

  const areaCount = Object.keys(uniqueAreas).length;

  return (
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">Map Visualization</h3>
      <div className="border border-gray-200 rounded-lg bg-gray-50">
        {/* Accordion Header */}
        <div
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-100 rounded-t-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base">{mapTemplate.name}</h3>
            <span className="text-sm text-gray-500">({areaCount} khu vực)</span>
          </div>
          <div className="flex items-center gap-2">
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>

        {/* Accordion Content */}
        {isOpen && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap gap-4">
                {uniqueZones.map((area, index) => (
                  <div key={index} className="flex items-center">
                    <div
                      className="w-4 h-4 mr-2"
                      style={{ backgroundColor: area.fillColor }}
                    ></div>
                    <span className="text-sm">{area.zone}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <canvas
                ref={canvasRef}
                className="border border-gray-300 rounded-lg shadow-md w-full"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapVisual;
