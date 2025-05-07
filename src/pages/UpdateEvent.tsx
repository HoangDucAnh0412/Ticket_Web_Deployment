import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Event {
  eventId: number;
  categoryId: number;
  organizerId: number;
  mapTemplateId: number;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl: string;
  bannerUrl: string;
  status: string;
}

interface UpdateEventProps {
  event: Event;
  onEventUpdated: () => void;
  onCancel: () => void;
}

const UpdateEvent = ({ event, onEventUpdated, onCancel }: UpdateEventProps) => {
  const [formData, setFormData] = useState({
    eventId: event.eventId,
    categoryId: event.categoryId,
    organizerId: event.organizerId,
    mapTemplateId: event.mapTemplateId,
    name: event.name,
    description: event.description,
    date: event.date,
    time: event.time,
    location: event.location,
    status: event.status,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>(event.imageUrl || "");
  const [bannerFileName, setBannerFileName] = useState<string>(event.bannerUrl || "");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = "Tên sự kiện là bắt buộc.";
    if (!formData.date) newErrors.date = "Ngày là bắt buộc.";
    if (!formData.time) newErrors.time = "Giờ là bắt buộc.";
    if (!formData.location.trim()) newErrors.location = "Địa điểm là bắt buộc.";
    if (!formData.status) newErrors.status = "Trạng thái là bắt buộc.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "banner") => {
    const file = e.target.files?.[0] || null;
    if (type === "image") {
      setImageFile(file);
      setImageFileName(file ? file.name : event.imageUrl || "");
    } else if (type === "banner") {
      setBannerFile(file);
      setBannerFileName(file ? file.name : event.bannerUrl || "");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const data = new FormData();
      data.append("event", new Blob([JSON.stringify(formData)], { type: "application/json" }));

      if (imageFile) {
        data.append("image", imageFile);
      }
      if (bannerFile) {
        data.append("banner", bannerFile);
      }

      await axios.put(
        `http://localhost:8085/api/admin/events/${event.eventId}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Cập nhật sự kiện thành công!"); // Hiển thị thông báo thành công
      onEventUpdated(); // Gọi callback để cập nhật danh sách sự kiện
    } catch (error: any) {
      console.error("Lỗi khi cập nhật sự kiện:", error);
      const errorMessage =
        error.code === "ERR_NETWORK"
          ? "Không thể kết nối đến server. Vui lòng kiểm tra server tại http://localhost:8085."
          : error.response?.data?.message ||
            error.message ||
            "Không thể cập nhật sự kiện. Vui lòng kiểm tra server.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />
      <h3 className="text-2xl font-semibold mb-4 text-indigo-700 border-b pb-2">
        📝 Cập nhật sự kiện
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ID sự kiện</label>
            <input
              type="number"
              name="eventId"
              value={formData.eventId}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category ID</label>
            <input
              type="number"
              name="categoryId"
              value={formData.categoryId}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Organizer ID</label>
            <input
              type="number"
              name="organizerId"
              value={formData.organizerId}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Map Template ID</label>
            <input
              type="number"
              name="mapTemplateId"
              value={formData.mapTemplateId}
              disabled
              className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên sự kiện</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Ngày</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Giờ</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Địa điểm</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Chọn trạng thái</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Hình ảnh</label>
            <div className="mt-1 relative">
              <input
                id="image-input"
                type="file"
                name="image"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "image")}
                className="hidden"
              />
              <label
                htmlFor="image-input"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <span className="text-gray-700 truncate">
                  {imageFileName || "Chọn hình ảnh"}
                </span>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Banner</label>
            <div className="mt-1 relative">
              <input
                id="banner-input"
                type="file"
                name="banner"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "banner")}
                className="hidden"
              />
              <label
                htmlFor="banner-input"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50"
              >
                <span className="text-gray-700 truncate">
                  {bannerFileName || "Chọn banner"}
                </span>
              </label>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mô tả</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={4}
          />
        </div>
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
          >
            Lưu
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateEvent;