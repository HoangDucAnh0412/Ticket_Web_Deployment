import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

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
      parsedValue = value === "" ? "" : parseFloat(value);
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
      toast.error("Không tìm thấy token xác thực.");
      return;
    }

    if (
      !updatedTemplate.name ||
      !updatedTemplate.description ||
      updatedTemplate.areaCount <= 0 ||
      updatedTemplate.mapWidth <= 0 ||
      updatedTemplate.mapHeight <= 0
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    if (updatedTemplate.areas.length !== updatedTemplate.areaCount) {
      toast.error("Số lượng khu vực không khớp với areaCount.");
      return;
    }

    if (
      updatedTemplate.areas.some(
        (area) =>
          area.x < 0 || area.y < 0 || area.width <= 0 || area.height <= 0
      )
    ) {
      toast.error(
        "Thông tin khu vực không hợp lệ. Không được nhập số âm hoặc giá trị bằng 0."
      );
      return;
    }

    const areaNames = updatedTemplate.areas.map((area) => area.name.trim());
    const hasDuplicateNames = areaNames.some(
      (name, index) => areaNames.indexOf(name) !== index && name !== ""
    );
    if (hasDuplicateNames) {
      toast.error("Tên khu vực không được trùng lặp.");
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
          x: area.x,
          y: area.y,
          width: area.width,
          height: area.height,
          vertices: area.vertices || [],
          zone: area.zone || "",
          fillColor: area.fillColor || "#000000",
        };

        return axios.put(
          `http://localhost:8085/api/admin/map-templates/${template.templateId}/areas/${area.templateAreaId}`,
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
      const [templateResponse, ...areaResponses] = await Promise.all([
        axios.put(
          `http://localhost:8085/api/admin/map-templates/${template.templateId}`,
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

      toast.success("Cập nhật template map và các khu vực thành công!");
      onUpdate(true);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Có lỗi xảy ra: ${msg}`);
      onUpdate(false);
    }
  };

  const handleCancel = () => {
    onUpdate(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Cập nhật Template Map
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
              Tên template
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
            Mô tả
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
              Số lượng khu vực
            </label>
            <input
              type="number"
              name="areaCount"
              value={updatedTemplate.areaCount}
              onChange={handleInputChange}
              required
              min="1"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chiều rộng map (px)
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
              Chiều cao map (px)
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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Khu vực</h3>
          {updatedTemplate.areas.map((area, idx) => (
            <div
              key={area.templateAreaId}
              className="mb-4 p-4 border border-gray-300 rounded-md"
            >
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID Khu vực
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
                    Tên khu vực
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
                    Tọa độ X
                  </label>
                  <input
                    type="number"
                    name="x"
                    value={area.x}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    min="0"
                    step="any"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tọa độ Y
                  </label>
                  <input
                    type="number"
                    name="y"
                    value={area.y}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    min="0"
                    step="any"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Chiều rộng
                  </label>
                  <input
                    type="number"
                    name="width"
                    value={area.width}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    min="1"
                    step="any"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Chiều cao
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={area.height}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    min="1"
                    step="any"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Màu khu vực
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
                    Khu vực là STAGE
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
                  Vertices (dán JSON array)
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
                          "Dữ liệu vertices phải là mảng các object có x, y dạng số."
                        );
                      }
                    } catch {
                      toast.error(
                        "Dữ liệu vertices không hợp lệ. Hãy dán đúng định dạng JSON array."
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
            Hủy
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateMapTemplate;
