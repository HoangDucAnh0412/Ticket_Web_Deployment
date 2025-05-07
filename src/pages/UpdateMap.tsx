import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Area {
  templateAreaId: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
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

const UpdateMapTemplate: React.FC<UpdateMapTemplateProps> = ({ template, onUpdate }) => {
  const [updatedTemplate, setUpdatedTemplate] = useState<MapTemplate>({
    ...template,
    areas: template.areas.map((area) => ({ ...area })),
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index?: number
  ) => {
    const { name, value } = e.target;
    const parsedValue =
      name === "areaCount" || name === "mapWidth" || name === "mapHeight" || name === "x" || name === "y" || name === "width" || name === "height"
        ? parseInt(value) || 0
        : value;

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
        (area) => area.x < 0 || area.y < 0 || area.width <= 0 || area.height <= 0
      )
    ) {
      toast.error("Thông tin khu vực không hợp lệ. Không được nhập số âm hoặc giá trị bằng 0.");
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
      const payload = {
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
        })),
      };

      await axios.put(
        `http://localhost:8085/api/admin/map-templates/${template.templateId}`, // Sử dụng templateId động
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Cập nhật template map thành công!");
      onUpdate(true); // Báo cáo thành công
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Có lỗi xảy ra: ${msg}`);
      onUpdate(false); // Báo cáo thất bại
    }
  };

  const handleCancel = () => {
    onUpdate(false); // Khi hủy, không làm mới danh sách
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Cập nhật Template Map</h2>

      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Template ID</label>
            <input
              type="number"
              name="templateId"
              value={updatedTemplate.templateId}
              disabled
              className="mt-1 block w-full p-2 bg-gray-200 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên template</label>
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
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
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
            <label className="block text-sm font-medium text-gray-700">Số lượng khu vực</label>
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
            <label className="block text-sm font-medium text-gray-700">Chiều rộng map (px)</label>
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
            <label className="block text-sm font-medium text-gray-700">Chiều cao map (px)</label>
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
            <div key={area.templateAreaId} className="mb-4 p-4 border border-gray-300 rounded-md">
              <div className="grid md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ID Khu vực</label>
                  <input
                    type="number"
                    name="templateAreaId"
                    value={area.templateAreaId}
                    disabled
                    className="mt-1 block w-full p-2 bg-gray-200 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tên khu vực</label>
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
                  <label className="block text-sm font-medium text-gray-700">Tọa độ X</label>
                  <input
                    type="number"
                    name="x"
                    value={area.x}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    min="0"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tọa độ Y</label>
                  <input
                    type="number"
                    name="y"
                    value={area.y}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    min="0"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chiều rộng</label>
                  <input
                    type="number"
                    name="width"
                    value={area.width}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    min="1"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Chiều cao</label>
                  <input
                    type="number"
                    name="height"
                    value={area.height}
                    onChange={(e) => handleInputChange(e, idx)}
                    required
                    min="1"
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
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