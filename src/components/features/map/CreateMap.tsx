import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../../../utils/const";

interface Vertex {
  x: number;
  y: number;
}

interface TemplateArea {
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

interface MapTemplateData {
  name: string;
  description: string;
  areaCount: number;
  mapWidth: number;
  mapHeight: number;
  areas: TemplateArea[];
}

interface CreateMapTemplateProps {
  onMapCreated: (success: boolean) => void; // Cập nhật prop để nhận tham số success
}

const ADMIN_CREATE_MAP_TEMPLATE_ENDPOINT = `${BASE_URL}/api/admin/map-templates`;

const CreateMapTemplate: React.FC<CreateMapTemplateProps> = ({
  onMapCreated,
}) => {
  const initialMapTemplateData: MapTemplateData = {
    name: "",
    description: "",
    areaCount: 0,
    mapWidth: 0,
    mapHeight: 0,
    areas: [
      {
        name: "",
        x: null,
        y: null,
        width: null,
        height: null,
        vertices: [],
        isStage: false,
      },
    ],
  };

  const [mapTemplate, setMapTemplate] = useState<MapTemplateData>(
    initialMapTemplateData
  );

  const handleAreaInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    areaIdx: number
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = value === "" ? null : parseFloat(value);
    }
    if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    const updatedAreas = [...mapTemplate.areas];
    updatedAreas[areaIdx] = { ...updatedAreas[areaIdx], [name]: parsedValue };
    setMapTemplate({ ...mapTemplate, areas: updatedAreas });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = value === "" ? "" : parseFloat(value);
    }
    setMapTemplate({ ...mapTemplate, [name]: parsedValue });
  };

  const handleAddArea = () => {
    if (mapTemplate.areas.length >= mapTemplate.areaCount) {
      toast.error(
        `Cannot add area. Template only supports up to ${mapTemplate.areaCount} areas.`
      );
      return;
    }
    setMapTemplate({
      ...mapTemplate,
      areas: [
        ...mapTemplate.areas,
        {
          name: "",
          x: null,
          y: null,
          width: null,
          height: null,
          vertices: [],
          isStage: false,
        },
      ],
    });
  };

  const handleRemoveArea = (index: number) => {
    setMapTemplate({
      ...mapTemplate,
      areas: mapTemplate.areas.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to log in to create a map template.");
      return;
    }

    if (
      !mapTemplate.name ||
      !mapTemplate.description ||
      mapTemplate.areaCount <= 0 ||
      mapTemplate.mapWidth <= 0 ||
      mapTemplate.mapHeight <= 0
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (mapTemplate.areas.length !== mapTemplate.areaCount) {
      toast.error("The number of areas does not match areaCount.");
      return;
    }

    if (
      mapTemplate.areas.some(
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

    const areaNames = mapTemplate.areas.map((area) => area.name.trim());
    const hasDuplicateNames = areaNames.some(
      (name, index) => areaNames.indexOf(name) !== index
    );
    if (hasDuplicateNames) {
      toast.error("Area names must be unique.");
      return;
    }

    try {
      const payload = {
        name: mapTemplate.name,
        description: mapTemplate.description,
        areaCount: mapTemplate.areaCount,
        mapWidth: mapTemplate.mapWidth,
        mapHeight: mapTemplate.mapHeight,
        areas: mapTemplate.areas.map((area) => {
          const areaPayload: any = {
            name: area.name,
            x: area.x,
            y: area.y,
            width: area.width,
            height: area.height,
            vertices: area.vertices || [],
            fillColor: area.fillColor,
            zone: area.zone,
          };
          if (area.isStage) areaPayload.isStage = true;
          return areaPayload;
        }),
      };

      const response = await axios.post(
        ADMIN_CREATE_MAP_TEMPLATE_ENDPOINT,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success(
        `Map template created successfully with ID: ${response.data.templateId}`
      );
      setMapTemplate(initialMapTemplateData);
      setTimeout(() => {
        onMapCreated(true); // Truyền true để báo tạo thành công
      }, 2000); // Đợi 2 giây để hiển thị toast
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`An error occurred: ${msg}`);
      setTimeout(() => {
        onMapCreated(false); // Truyền false nếu tạo thất bại
      }, 2000);
    }
  };

  const handleCancel = () => {
    setMapTemplate(initialMapTemplateData);
    onMapCreated(false); // Khi hủy, không cần làm mới danh sách
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Create New Map Template
      </h2>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              name="name"
              value={mapTemplate.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Area Count
            </label>
            <input
              type="number"
              name="areaCount"
              value={mapTemplate.areaCount}
              onChange={handleInputChange}
              required
              min="1"
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
            value={mapTemplate.description}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Map Width (px)
            </label>
            <input
              type="number"
              name="mapWidth"
              value={mapTemplate.mapWidth}
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
              value={mapTemplate.mapHeight}
              onChange={handleInputChange}
              required
              min="1"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Areas</h3>
          {mapTemplate.areas.map((area, idx) => (
            <div
              key={idx}
              className="mb-4 p-4 border border-gray-300 rounded-md"
            >
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Area Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={area.name}
                    onChange={(e) => handleAreaInputChange(e, idx)}
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
                    onChange={(e) => handleAreaInputChange(e, idx)}
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
                    onChange={(e) => handleAreaInputChange(e, idx)}
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
                    onChange={(e) => handleAreaInputChange(e, idx)}
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
                    onChange={(e) => handleAreaInputChange(e, idx)}
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
                    onChange={(e) => handleAreaInputChange(e, idx)}
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
                      onChange={(e) => handleAreaInputChange(e, idx)}
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
                        handleAreaInputChange(
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
                    onChange={(e) => handleAreaInputChange(e, idx)}
                    className="mt-1 w-10 h-10"
                  />
                </div>
              </div>
              <div className="mt-2 ">
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
                        const updatedAreas = [...mapTemplate.areas];
                        updatedAreas[idx].vertices = parsed;
                        setMapTemplate({ ...mapTemplate, areas: updatedAreas });
                      } else {
                        toast.error(
                          "Vertices data must be an array of objects with x, y as numbers."
                        );
                      }
                    } catch {
                      toast.error("Invalid vertices data.");
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
              <button
                type="button"
                onClick={() => handleRemoveArea(idx)}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Delete Area
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddArea}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Area
          </button>
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
            Create Template
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMapTemplate;
