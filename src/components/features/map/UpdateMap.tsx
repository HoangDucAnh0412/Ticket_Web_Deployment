import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../../utils/const";

interface Vertex {
  x: number;
  y: number;
}

interface Area {
  templateAreaId: number;
  name: string;
  x: number | null;
  y: number | null;
  width: number | null;
  height: number | null;
  vertices: Vertex[];
  zone?: string;
  fillColor?: string;
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
  message: string | null;
}

interface UpdateMapTemplateProps {
  template: MapTemplate;
  onUpdate: (success: boolean) => void;
}

const ADMIN_UPDATE_MAP_TEMPLATE_ENDPOINT = (templateId: number) =>
  `${BASE_URL}/api/admin/map-templates/${templateId}`;
const ADMIN_UPDATE_MAP_AREA_ENDPOINT = (templateId: number, areaId: number) =>
  `${BASE_URL}/api/admin/map-templates/${templateId}/areas/${areaId}`;
const ADMIN_DELETE_MAP_AREA_ENDPOINT = (templateId: number, areaId: number) =>
  `${BASE_URL}/api/admin/map-templates/${templateId}/areas/${areaId}`;

const UpdateMapTemplate: React.FC<UpdateMapTemplateProps> = ({
  template,
  onUpdate,
}) => {
  const [updatedTemplate, setUpdatedTemplate] = useState<MapTemplate>({
    ...template,
    areas: template.areas.map((area) => ({
      ...area,
      vertices: area.vertices || [],
      zone: area.zone || "",
      fillColor: area.fillColor || "",
      isStage: area.isStage || false,
    })),
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;

    if (type === "number") {
      parsedValue = value === "" ? null : parseFloat(value);
    }
    if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }

    if (index !== undefined) {
      const updatedAreas = [...updatedTemplate.areas];
      updatedAreas[index] = { ...updatedAreas[index], [name]: parsedValue };
      setUpdatedTemplate({ ...updatedTemplate, areas: updatedAreas });
    } else {
      setUpdatedTemplate({ ...updatedTemplate, [name]: parsedValue });
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found.");
      return;
    }

    if (
      !updatedTemplate.name ||
      !updatedTemplate.description ||
      updatedTemplate.mapWidth <= 0 ||
      updatedTemplate.mapHeight <= 0
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (
      updatedTemplate.areas.some(
        (area) =>
          (area.x !== null && area.x < 0) ||
          (area.y !== null && area.y < 0) ||
          (area.width !== null && area.width < 0) ||
          (area.height !== null && area.height < 0)
      )
    ) {
      toast.error(
        "Invalid area information. Negative numbers are not allowed."
      );
      return;
    }

    const areaNames = updatedTemplate.areas.map((area) => area.name.trim());
    const hasDuplicateNames = areaNames.some(
      (name, index) => areaNames.indexOf(name) !== index && name !== ""
    );
    if (hasDuplicateNames) {
      toast.error("Area names must be unique.");
      return;
    }

    try {
      // Prepare the main template update payload
      const templatePayload = {
        name: updatedTemplate.name,
        description: updatedTemplate.description,
        areaCount: updatedTemplate.areaCount,
        mapWidth: updatedTemplate.mapWidth,
        mapHeight: updatedTemplate.mapHeight,
        areas: updatedTemplate.areas.map((area) => ({
          templateAreaId: area.templateAreaId,
          name: area.name,
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          vertices: area.vertices || [],
          fillColor: area.fillColor,
          zone: area.zone,
          isStage: area.isStage,
        })),
      };

      // Create an array of promises for area updates
      const areaUpdatePromises = updatedTemplate.areas.map((area) => {
        const areaPayload = {
          name: area.name,
          x: area.x === null ? 0 : area.x,
          y: area.y === null ? 0 : area.y,
          width: area.width === null ? 0 : area.width,
          height: area.height === null ? 0 : area.height,
          vertices: area.vertices || [],
          zone: area.zone || "",
          fillColor: area.fillColor || "#000000",
          isStage: area.isStage || false,
        };

        return axios.put(
          ADMIN_UPDATE_MAP_AREA_ENDPOINT(
            template.templateId,
            area.templateAreaId
          ),
          areaPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      });

      // Execute both template update and area updates simultaneously
      const [] = await Promise.all([
        axios.put(
          ADMIN_UPDATE_MAP_TEMPLATE_ENDPOINT(template.templateId),
          templatePayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        ),
        ...areaUpdatePromises,
      ]);

      toast.success("Map template and areas updated successfully!");
      onUpdate(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`An error occurred: ${msg}`);
      onUpdate(false);
    }
  };

  const handleDeleteArea = async (areaId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found.");
      return;
    }

    try {
      await axios.delete(
        ADMIN_DELETE_MAP_AREA_ENDPOINT(template.templateId, areaId),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Cập nhật state sau khi xóa
      setUpdatedTemplate({
        ...updatedTemplate,
        areas: updatedTemplate.areas.filter(
          (area) => area.templateAreaId !== areaId
        ),
        areaCount: updatedTemplate.areaCount - 1,
      });

      toast.success("Area deleted successfully!");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`An error occurred while deleting area: ${msg}`);
    }
  };

  const handleCancel = () => {
    onUpdate(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Update Map Template
      </h2>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Template ID
            </label>
            <input
              type="number"
              name="templateId"
              value={updatedTemplate.templateId}
              disabled
              className="mt-1 block w-full p-2 bg-gray-200 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              name="name"
              value={updatedTemplate.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={updatedTemplate.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Area Count
            </label>
            <input
              type="number"
              name="areaCount"
              value={updatedTemplate.areas.length}
              disabled
              className="mt-1 block w-full p-2 bg-gray-200 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Map Width (px)
            </label>
            <input
              type="number"
              name="mapWidth"
              value={updatedTemplate.mapWidth}
              onChange={handleInputChange}
              required
              min="1"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Map Height (px)
            </label>
            <input
              type="number"
              name="mapHeight"
              value={updatedTemplate.mapHeight}
              onChange={handleInputChange}
              required
              min="1"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Areas</h3>
          {updatedTemplate.areas.map((area, idx) => (
            <div
              key={area.templateAreaId}
              className="mb-4 p-4 border border-gray-300 rounded-md relative"
            >
              <button
                type="button"
                onClick={() => handleDeleteArea(area.templateAreaId)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Area ID
                  </label>
                  <input
                    type="number"
                    name="templateAreaId"
                    value={area.templateAreaId}
                    disabled
                    className="mt-1 block w-full p-2 bg-gray-200 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Area Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={area.name}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Zone
                  </label>
                  <input
                    type="text"
                    name="zone"
                    value={area.zone || ""}
                    onChange={(e) => handleInputChange(e, idx)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    X Coordinate
                  </label>
                  <input
                    type="number"
                    name="x"
                    value={area.x === null ? "" : area.x}
                    onChange={(e) => handleInputChange(e, idx)}
                    min="0"
                    step="any"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Y Coordinate
                  </label>
                  <input
                    type="number"
                    name="y"
                    value={area.y === null ? "" : area.y}
                    onChange={(e) => handleInputChange(e, idx)}
                    min="0"
                    step="any"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Width
                  </label>
                  <input
                    type="number"
                    name="width"
                    value={area.width === null ? "" : area.width}
                    onChange={(e) => handleInputChange(e, idx)}
                    min="0"
                    step="any"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Height
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={area.height === null ? "" : area.height}
                    onChange={(e) => handleInputChange(e, idx)}
                    min="0"
                    step="any"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Area Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      name="fillColor"
                      value={area.fillColor || ""}
                      onChange={(e) => handleInputChange(e, idx)}
                      className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <input
                      type="color"
                      value={
                        area.fillColor &&
                        /^#[0-9A-Fa-f]{6}$/.test(area.fillColor)
                          ? area.fillColor
                          : "#000000"
                      }
                      onChange={(e) =>
                        handleInputChange(
                          {
                            ...e,
                            target: {
                              ...e.target,
                              name: "fillColor",
                              value: e.target.value,
                            },
                          } as React.ChangeEvent<HTMLInputElement>,
                          idx
                        )
                      }
                      className="w-15 h-10 p-0 border-none"
                      style={{ background: area.fillColor || "#000000" }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Is STAGE Area
                  </label>
                  <input
                    type="checkbox"
                    name="isStage"
                    checked={!!area.isStage}
                    onChange={(e) => handleInputChange(e, idx)}
                    className="mt-1 w-10 h-10"
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700">
                  Vertices (paste JSON array)
                </label>
                <textarea
                  value={JSON.stringify(area.vertices || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const val = e.target.value;
                      const parsed = JSON.parse(val);
                      if (
                        Array.isArray(parsed) &&
                        parsed.every(
                          (v) =>
                            typeof v.x === "number" && typeof v.y === "number"
                        )
                      ) {
                        const updatedAreas = [...updatedTemplate.areas];
                        updatedAreas[idx].vertices = parsed;
                        setUpdatedTemplate({
                          ...updatedTemplate,
                          areas: updatedAreas,
                        });
                      } else {
                        toast.error(
                          "Vertices data must be an array of objects with x, y as numbers."
                        );
                      }
                    } catch {
                      toast.error(
                        "Invalid vertices data. Please paste a valid JSON array."
                      );
                    }
                  }}
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded font-mono text-xs"
                  placeholder='[
    {"x": 180.305, "y": 320.435},
    {"x": 464.479, "y": 320.435}
  ]'
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateMapTemplate;
