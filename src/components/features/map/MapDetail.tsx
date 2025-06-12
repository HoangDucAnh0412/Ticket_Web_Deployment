import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaChevronDown, FaChevronUp, FaPlus } from "react-icons/fa";
import { BASE_URL } from "../../../utils/const";
import MapCanvas from "./MapCanvas";

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

const ADMIN_MAP_TEMPLATE_DETAIL_ENDPOINT = (id: string | undefined) =>
  `${BASE_URL}/api/admin/map-templates/${id}`;

const MapDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [template, setTemplate] = useState<MapTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAreaListOpen, setIsAreaListOpen] = useState(false);
  const [isMapVisualOpen, setIsMapVisualOpen] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found.");
          navigate("/login");
          return;
        }

        const response = await axios.get<MapTemplate>(
          ADMIN_MAP_TEMPLATE_DETAIL_ENDPOINT(id),
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setTemplate(response.data);
      } catch (error: any) {
        console.error("Error fetching template:", error);
        toast.error("Failed to load template details.");
        navigate("/dashboard/map");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplate();
    }
  }, [id, navigate]);

  const handleCreateNewArea = () => {
    navigate(`/dashboard/map/${id}/area`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">Template not found</div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav className="p-6 flex items-center text-sm text-gray-500 space-x-2">
        <Link to="/dashboard" className="hover:underline text-blue-600">
          Home
        </Link>
        <span>&gt;</span>
        <Link to="/dashboard/map" className="hover:underline text-blue-600">
          Map Template
        </Link>
        <span>&gt;</span>
        <span className="text-gray-700 font-semibold">Map Details</span>
      </nav>

      {/* Main content */}
      <div className="bg-white p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Template Info */}
        <div className="flex-1 flex flex-col gap-2 h-full justify-between">
          <div className="text-xl md:text-2xl font-bold text-black mb-1">
            {template.name}
          </div>
          <div className="mb-3 text-gray-500 text-sm font-medium">
            {template.description}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-4 text-sm mb-2">
            <span className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-gray-700 font-semibold text-xs min-w-[100px] text-center">
              Template ID: <b>{template.templateId}</b>
            </span>
            <span className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-gray-700 font-semibold text-xs min-w-[100px] text-center">
              Area Count: <b>{template.areaCount}</b>
            </span>
            <span className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-gray-700 font-semibold text-xs min-w-[100px] text-center">
              Width: <b>{template.mapWidth}</b>
            </span>
            <span className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-gray-700 font-semibold text-xs min-w-[100px] text-center">
              Height: <b>{template.mapHeight}</b>
            </span>
          </div>
        </div>
      </div>

      {/* Area List Section */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Area List</h2>
          <button
            onClick={handleCreateNewArea}
            className="bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600"
            title="Add Area"
          >
            <FaPlus />
          </button>
        </div>
        <div className="border border-gray-200 rounded-lg bg-gray-50">
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-100 rounded-t-lg"
            onClick={() => setIsAreaListOpen(!isAreaListOpen)}
          >
            <div className="flex items-center gap-4">
              <span className="font-semibold text-base">Area List</span>
              <span className="text-gray-500 text-sm">
                ({template.areas.length} Areas)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isAreaListOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>

          {isAreaListOpen && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
              {template.areas.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        <th className="px-4 py-2 border-b">ID</th>
                        <th className="px-4 py-2 border-b">Name</th>
                        <th className="px-4 py-2 border-b">X</th>
                        <th className="px-4 py-2 border-b">Y</th>
                        <th className="px-4 py-2 border-b">Width</th>
                        <th className="px-4 py-2 border-b">Height</th>
                        <th className="px-4 py-2 border-b">Zone</th>
                        <th className="px-4 py-2 border-b">Vertices</th>
                      </tr>
                    </thead>
                    <tbody>
                      {template.areas.map((area) => (
                        <tr key={area.templateAreaId} className="text-left">
                          <td className="px-4 py-2 border-b">
                            {area.templateAreaId}
                          </td>
                          <td className="px-4 py-2 border-b">{area.name}</td>
                          <td className="px-4 py-2 border-b">{area.x}</td>
                          <td className="px-4 py-2 border-b">{area.y}</td>
                          <td className="px-4 py-2 border-b">{area.width}</td>
                          <td className="px-4 py-2 border-b">{area.height}</td>
                          <td className="px-4 py-2 border-b">{area.zone}</td>
                          <td className="px-4 py-2 border-b">
                            <div className="max-h-32 overflow-y-auto">
                              {area.vertices.map((vertex, index) => (
                                <div key={index} className="text-sm">
                                  Point {index + 1}: ({vertex.x}, {vertex.y})
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 mt-2">No areas available.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Visualization Section */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Map Visualization</h2>
        <div className="border border-gray-200 rounded-lg bg-gray-50">
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-100 rounded-t-lg"
            onClick={() => setIsMapVisualOpen(!isMapVisualOpen)}
          >
            <div className="flex items-center gap-4">
              <span className="font-semibold text-base">Map Visualization</span>
              <span className="text-gray-500 text-sm">
                ({template.areas.length} Areas)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isMapVisualOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
          </div>

          {isMapVisualOpen && (
            <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-wrap gap-4">
                  {template.areas
                    .filter(
                      (area, index, self) =>
                        index ===
                        self.findIndex((a) => a.fillColor === area.fillColor)
                    )
                    .map((area, index) => (
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
                <MapCanvas template={template} maxSize={1200} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapDetail;
