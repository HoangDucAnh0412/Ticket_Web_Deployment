import { useEffect, useState } from "react";
import axios from "axios";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { BASE_URL } from "../../../../utils/const";
import MapCanvas from "../../map/MapCanvas";

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

// Define endpoint constants
const ORGANIZER_MAP_TEMPLATES_ENDPOINT = `${BASE_URL}/api/organizer/map-templates`;
const ORGANIZER_EVENT_AREAS_ENDPOINT = (eventId: string) =>
  `${BASE_URL}/api/organizer/events/${eventId}/areas`;

const MapVisual: React.FC<MapVisualProps> = ({ eventId, mapTemplateId }) => {
  const [mapTemplate, setMapTemplate] = useState<MapTemplate | null>(null);
  const [eventAreas, setEventAreas] = useState<EventArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [templatesRes, areasRes] = await Promise.all([
          axios.get<MapTemplate[]>(ORGANIZER_MAP_TEMPLATES_ENDPOINT, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get<{ data: EventArea[] }>(
            ORGANIZER_EVENT_AREAS_ENDPOINT(eventId),
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        // Find the specific map template from the list
        const foundTemplate = templatesRes.data.find(
          (template) => template.templateId === mapTemplateId
        );

        if (foundTemplate) {
          // Filter areas to only include those that are in eventAreas
          const selectedAreaIds = areasRes.data.data.map(
            (area) => area.templateAreaId
          );
          const filteredTemplate = {
            ...foundTemplate,
            areas: foundTemplate.areas.filter((area) =>
              selectedAreaIds.includes(area.templateAreaId)
            ),
          };
          setMapTemplate(filteredTemplate);
        } else {
          console.error("Map template not found");
        }
        setEventAreas(areasRes.data.data);
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, mapTemplateId]);

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
              <MapCanvas
                template={mapTemplate}
                maxSize={800}
                showLabels={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapVisual;
