import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaInfoCircle,
  FaTrash,
  FaPlus,
  FaEdit,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import CreateMapTemplate from "../../components/features/map/CreateMap";
import UpdateMapTemplate from "../../components/features/map/UpdateMap";

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
  message: string | null;
}

const MapTemplate = () => {
  const navigate = useNavigate();
  const [mapTemplates, setMapTemplates] = useState<MapTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MapTemplate | null>(
    null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchMapTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found.");
        return;
      }

      const response = await axios.get<MapTemplate[]>(
        "http://localhost:8085/api/admin/map-templates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMapTemplates(response.data);
    } catch (error: any) {
      console.error("Error fetching Map Templates:", error);
      toast.error("An error occurred while fetching Map Templates.");
    }
  };

  useEffect(() => {
    fetchMapTemplates();
  }, []);

  const filteredAndSortedTemplates = [...mapTemplates]
    .filter((template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortDirection === "asc"
        ? a.templateId - b.templateId
        : b.templateId - a.templateId
    );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleShowDetail = (template: MapTemplate) => {
    navigate(`/dashboard/map/${template.templateId}`);
  };

  const handleDeleteTemplate = async (templateId: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure you want to delete?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "grey",
      cancelButtonColor: "red",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found.");
          return;
        }

        await axios.delete(
          `http://localhost:8085/api/admin/map-templates/${templateId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setMapTemplates((prev) =>
          prev.filter((template) => template.templateId !== templateId)
        );
        toast.success("Map Template deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting Map Template:", error);
        toast.error("An error occurred while deleting Map Template.");
      }
    }
  };

  const handleShowUpdate = (template: MapTemplate) => {
    setSelectedTemplate(template);
    setShowUpdateModal(true);
  };

  // Draw Map on Canvas
  useEffect(() => {
    if (selectedTemplate && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Increase the scale factor for larger map
        const scale = Math.min(
          800 / selectedTemplate.mapWidth,
          800 / selectedTemplate.mapHeight
        );
        canvas.width = selectedTemplate.mapWidth * scale;
        canvas.height = selectedTemplate.mapHeight * scale;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw map outline
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Draw areas
        selectedTemplate.areas.forEach((area) => {
          // Draw polygon using vertices
          if (area.vertices && area.vertices.length > 0) {
            ctx.beginPath();
            ctx.moveTo(area.vertices[0].x * scale, area.vertices[0].y * scale);
            for (let i = 1; i < area.vertices.length; i++) {
              ctx.lineTo(
                area.vertices[i].x * scale,
                area.vertices[i].y * scale
              );
            }
            ctx.closePath();
            ctx.fillStyle = area.fillColor;
            ctx.fill();
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Calculate centroid
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

            // Find the two vertices with the largest horizontal (x) distance
            let maxHorzDist = 0,
              horzV1 = area.vertices[0],
              horzV2 = area.vertices[0];
            for (let i = 0; i < area.vertices.length; i++) {
              for (let j = i + 1; j < area.vertices.length; j++) {
                const horzDist = Math.abs(
                  area.vertices[i].x - area.vertices[j].x
                );
                if (horzDist > maxHorzDist) {
                  maxHorzDist = horzDist;
                  horzV1 = area.vertices[i];
                  horzV2 = area.vertices[j];
                }
              }
            }

            // Determine label position
            let labelX, labelY;
            if (area.name.trim().toLowerCase() === "stage") {
              labelX = ((horzV1.x + horzV2.x) / 2) * scale;
              labelY = ((horzV1.y + horzV2.y) / 2) * scale;
            } else {
              labelX = cx;
              labelY = cy;
            }

            // Handle multi-line area name: each word on its own line
            const nameWords = area.name.trim().split(/\s+/);
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
      }
    }
  }, [selectedTemplate]);

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-black">
            Map Template Management
          </h3>
          <h3 className="text-l text-gray-500 mt-2">
            A list of map templates in the app
          </h3>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search map by name..."
            className="px-4 py-2 border border-gray-300 rounded-md w-64"
          />
          <button
            onClick={handleSort}
            className="px-3 py-2 rounded bg-green-500 text-white"
            title="Sort by ID"
          >
            {sortDirection === "asc" ? (
              <FaSortAmountUp />
            ) : (
              <FaSortAmountDown />
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-500 bg-white mt-5">
        <div className="min-w-[800px]">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-300 text-gray-700 text-sm uppercase">
              <tr>
                <th className="px-3 py-3 border-b min-w-[80px] truncate">
                  Template ID
                </th>
                <th className="px-6 py-3 border-b min-w-[150px] max-w-[200px] truncate">
                  Name
                </th>
                <th className="px-6 py-3 border-b min-w-[120px] max-w-[250px] truncate">
                  Description
                </th>
                <th className="px-6 py-3 border-b min-w-[100px] truncate">
                  Area Count
                </th>
                <th className="px-6 py-3 border-b min-w-[100px] truncate">
                  Width
                </th>
                <th className="px-6 py-3 border-b min-w-[100px] truncate">
                  Height
                </th>
                <th className="px-6 py-3 border-b min-w-[150px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTemplates.length > 0 ? (
                filteredAndSortedTemplates.map((template) => (
                  <tr key={template.templateId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b truncate overflow-hidden whitespace-nowrap">
                      {template.templateId}
                    </td>
                    <td className="px-6 py-4 border-b min-w-[150px] max-w-[200px] truncate overflow-hidden whitespace-nowrap">
                      {template.name}
                    </td>
                    <td className="px-6 py-4 border-b min-w-[120px] max-w-[250px] truncate overflow-hidden whitespace-nowrap">
                      {template.description}
                    </td>
                    <td className="px-6 py-4 border-b truncate overflow-hidden whitespace-nowrap">
                      {template.areaCount}
                    </td>
                    <td className="px-6 py-4 border-b truncate overflow-hidden whitespace-nowrap">
                      {template.mapWidth}
                    </td>
                    <td className="px-6 py-4 border-b truncate overflow-hidden whitespace-nowrap">
                      {template.mapHeight}
                    </td>
                    <td className="px-6 py-4 border-b text-center space-x-2">
                      <button
                        onClick={() => handleShowUpdate(template)}
                        className="bg-sky-500 text-white px-3 py-2 rounded hover:bg-sky-600"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteTemplate(template.templateId)
                        }
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => handleShowDetail(template)}
                        className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
                        title="Details"
                      >
                        <FaInfoCircle />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No Map Templates available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:bg-yellow-600"
        title="Add Map Template"
      >
        <FaPlus />
      </button>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl relative">
            <CreateMapTemplate
              onMapCreated={(success: boolean) => {
                setShowCreateModal(false);
                if (success) {
                  fetchMapTemplates();
                }
              }}
            />
          </div>
        </div>
      )}

      {showUpdateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl">
            <UpdateMapTemplate
              template={selectedTemplate}
              onUpdate={(success: boolean) => {
                setShowUpdateModal(false);
                if (success) {
                  fetchMapTemplates();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapTemplate;
