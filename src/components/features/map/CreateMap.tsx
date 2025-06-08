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
        `Không thể thêm khu vực. Template chỉ hỗ trợ tối đa ${mapTemplate.areaCount} khu vực.`
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
      toast.error("Bạn cần đăng nhập để tạo template map.");
      return;
    }

    if (
      !mapTemplate.name ||
      !mapTemplate.description ||
      mapTemplate.areaCount <= 0 ||
      mapTemplate.mapWidth <= 0 ||
      mapTemplate.mapHeight <= 0
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    if (mapTemplate.areas.length !== mapTemplate.areaCount) {
      toast.error("Số lượng khu vực không khớp với areaCount.");
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
      toast.error("Thông tin khu vực không hợp lệ. Không được nhập số âm.");
      return;
    }

    const areaNames = mapTemplate.areas.map((area) => area.name.trim());
    const hasDuplicateNames = areaNames.some(
      (name, index) => areaNames.indexOf(name) !== index
    );
    if (hasDuplicateNames) {
      toast.error("Tên khu vực không được trùng lặp.");
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
        `Template map đã được tạo thành công với ID: ${response.data.templateId}`
      );
      setMapTemplate(initialMapTemplateData);
      setTimeout(() => {
        onMapCreated(true); // Truyền true để báo tạo thành công
      }, 2000); // Đợi 2 giây để hiển thị toast
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Có lỗi xảy ra: ${msg}`);
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
        Tạo Template Map Mới
      </h2>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên template
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
              Số lượng khu vực
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
            Mô tả
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
              Chiều rộng map (px)
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
              Chiều cao map (px)
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
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Khu vực</h3>
          {mapTemplate.areas.map((area, idx) => (
            <div
              key={idx}
              className="mb-4 p-4 border border-gray-300 rounded-md"
            >
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tên khu vực
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
                    Tọa độ X
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
                    Tọa độ Y
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
                    Chiều rộng
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
                    Chiều cao
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
                    Màu khu vực
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
                    Khu vực là STAGE
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
                        const updatedAreas = [...mapTemplate.areas];
                        updatedAreas[idx].vertices = parsed;
                        setMapTemplate({ ...mapTemplate, areas: updatedAreas });
                      } else {
                        toast.error(
                          "Dữ liệu vertices phải là mảng các object có x, y dạng số."
                        );
                      }
                    } catch {
                      toast.error("tạo khu vv.");
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
                Xóa khu vực
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddArea}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Thêm khu vực
          </button>
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
            Tạo template
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMapTemplate;
