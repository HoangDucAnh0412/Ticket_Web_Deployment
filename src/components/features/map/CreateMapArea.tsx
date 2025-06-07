import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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

const ADMIN_CREATE_MAP_AREA_ENDPOINT = (id: string | undefined) =>
  `${BASE_URL}/api/admin/map-templates/${id}/areas`;

const CreateMapArea: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [area, setArea] = useState<TemplateArea>({
    name: "",
    x: null,
    y: null,
    width: null,
    height: null,
    vertices: [],
    isStage: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let parsedValue: any = value;
    if (type === "number") {
      parsedValue = value === "" ? null : parseFloat(value);
    }
    if (type === "checkbox") {
      parsedValue = (e.target as HTMLInputElement).checked;
    }
    setArea({ ...area, [name]: parsedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form data before processing:", area);

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để tạo khu vực.");
      return;
    }

    if (!area.name) {
      toast.error("Vui lòng nhập tên khu vực.");
      return;
    }

    if (
      !area.vertices ||
      !Array.isArray(area.vertices) ||
      area.vertices.length === 0
    ) {
      toast.error("Vui lòng nhập vertices cho khu vực.");
      return;
    }

    const invalidVertices = area.vertices.some(
      (v) => typeof v.x !== "number" || typeof v.y !== "number"
    );
    if (invalidVertices) {
      toast.error("Vertices phải có định dạng {x: number, y: number}");
      return;
    }

    if (
      (area.x !== null && area.x < 0) ||
      (area.y !== null && area.y < 0) ||
      (area.width !== null && area.width < 0) ||
      (area.height !== null && area.height < 0)
    ) {
      toast.error("Thông tin khu vực không hợp lệ. Không được nhập số âm.");
      return;
    }

    try {
      const payload = {
        name: area.name.trim(),
        x: Number(area.x) || 0,
        y: Number(area.y) || 0,
        width: Number(area.width) || 0,
        height: Number(area.height) || 0,
        vertices: area.vertices.map((v) => ({
          x: Number(v.x),
          y: Number(v.y),
        })),
        fillColor: area.fillColor || "#000000",
        zone: area.zone?.trim() || "",
        isStage: Boolean(area.isStage),
      };

      console.log("Sending payload to API:", JSON.stringify(payload, null, 2));

      const response = await axios.post(
        ADMIN_CREATE_MAP_AREA_ENDPOINT(id),
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.status === 200 || response.status === 201) {
        toast.success("Khu vực đã được tạo thành công!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        setTimeout(() => {
          navigate(`/dashboard/map/${id}`);
        }, 2000);
      } else {
        toast.error("Có lỗi xảy ra khi tạo khu vực.");
      }
    } catch (err: any) {
      console.error("Error creating area:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error response status:", err.response.status);
        console.error("Error response headers:", err.response.headers);
        const msg = err.response.data?.message || err.message;
        toast.error(`Có lỗi xảy ra: ${msg}`);
      } else if (err.request) {
        console.error("Error request:", err.request);
        toast.error("Không thể kết nối đến server.");
      } else {
        console.error("Error message:", err.message);
        toast.error("Có lỗi xảy ra khi xử lý yêu cầu.");
      }
    }
  };

  const handleCancel = () => {
    navigate(`/dashboard/map/${id}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Thêm Khu Vực Mới
      </h2>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tên khu vực
            </label>
            <input
              type="text"
              name="name"
              value={area.name}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tọa độ X
            </label>
            <input
              type="number"
              name="x"
              value={area.x === null ? "" : area.x}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              min="0"
              step="any"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Chiều rộng
            </label>
            <input
              type="number"
              name="width"
              value={area.width === null ? "" : area.width}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              min="0"
              step="any"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
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
              onChange={handleInputChange}
              className="block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="color"
              value={
                area.fillColor && /^#[0-9A-Fa-f]{6}$/.test(area.fillColor)
                  ? area.fillColor
                  : "#000000"
              }
              onChange={(e) =>
                handleInputChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: "fillColor",
                    value: e.target.value,
                  },
                } as React.ChangeEvent<HTMLInputElement>)
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
            onChange={handleInputChange}
            className="mt-1 w-10 h-10"
          />
        </div>

        <div>
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
                    (v) => typeof v.x === "number" && typeof v.y === "number"
                  )
                ) {
                  setArea({ ...area, vertices: parsed });
                } else {
                  toast.error(
                    "Dữ liệu vertices phải là mảng các object có x, y dạng số."
                  );
                }
              } catch {
                toast.error("Dữ liệu vertices không hợp lệ.");
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

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Tạo khu vực
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMapArea;
