import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";

interface Area {
  name: string;
  templateAreaId: number;
  totalTickets: number;
  price: number;
}

interface EventData {
  categoryId: number;
  name: string;
  description: string;
  date: string;
  time: string;
  location: string;
  mapTemplateId: number;
  status: string;
  areas: Area[];
}

interface TemplateArea {
  templateAreaId: number;
  name: string;
}

const OrganizerCreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const initialEventData: EventData = {
    categoryId: 0,
    name: "",
    description: "",
    date: "",
    time: "",
    location: "",
    mapTemplateId: 0,
    status: "pending",
    areas: [{ name: "", templateAreaId: 0, totalTickets: 0, price: 0 }],
  };

  const [eventData, setEventData] = useState<EventData>(initialEventData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [bannerFileName, setBannerFileName] = useState<string>("");
  const [categories, setCategories] = useState<
    { categoryId: number; name: string }[]
  >([]);
  const [mapTemplates, setMapTemplates] = useState<
    { templateId: number; name: string; areas: Area[] }[]
  >([]);
  const [templateAreas, setTemplateAreas] = useState<Area[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để tạo sự kiện.");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const fetchCategories = axios.get(
      "http://localhost:8085/api/organizer/categories",
      { headers }
    );
    const fetchMapTemplates = axios.get(
      "http://localhost:8085/api/organizer/map-templates",
      { headers }
    );

    Promise.all([fetchCategories, fetchMapTemplates])
      .then(([catResp, mapResp]) => {
        setCategories(catResp.data);
        setMapTemplates(mapResp.data);
      })
      .catch((err) => toast.error(`Không thể tải dữ liệu: ${err.message}`));
  }, []);

  useEffect(() => {
    if (!eventData.mapTemplateId) {
      setTemplateAreas([]);
      return;
    }
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Find the selected map template from the already fetched templates
    const selectedTemplate = mapTemplates.find(
      (t) => t.templateId === eventData.mapTemplateId
    );
    if (selectedTemplate) {
      setTemplateAreas(selectedTemplate.areas || []);
    } else {
      setTemplateAreas([]);
    }
  }, [eventData.mapTemplateId, mapTemplates]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    index?: number
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    if (
      [
        "categoryId",
        "mapTemplateId",
        "templateAreaId",
        "totalTickets",
        "price",
      ].includes(name)
    ) {
      parsedValue = value === "" ? 0 : parseFloat(value) || 0;
    }

    if (index !== undefined && name === "templateAreaId") {
      const selectedAreaId = parseInt(value);
      const isAreaSelected = eventData.areas.some(
        (area, i) =>
          i !== index &&
          area.templateAreaId === selectedAreaId &&
          selectedAreaId !== 0
      );
      if (isAreaSelected) {
        toast.error("Khu vực này đã được chọn. Vui lòng chọn khu vực khác.");
        return;
      }
    }

    if (index !== undefined && name === "totalTickets") {
      const tickets = parseFloat(value);
      if (tickets <= 0) {
        toast.error("Tổng số vé phải lớn hơn 0.");
        return;
      }
    }

    if (index !== undefined && name === "price") {
      const price = parseFloat(value);
      if (price <= 0) {
        toast.error("Giá vé phải lớn hơn 0.");
        return;
      }
    }

    if (index !== undefined) {
      const updated = [...eventData.areas];
      updated[index] = { ...updated[index], [name]: parsedValue } as Area;
      setEventData({ ...eventData, areas: updated });
    } else {
      setEventData({ ...eventData, [name]: parsedValue } as any);
    }
  };

  const handleAddArea = () => {
    if (eventData.areas.length >= templateAreas.length) {
      toast.error(
        `Không thể thêm khu vực. Template chỉ hỗ trợ tối đa ${templateAreas.length} khu vực.`
      );
      return;
    }

    setEventData({
      ...eventData,
      areas: [
        ...eventData.areas,
        { name: "", templateAreaId: 0, totalTickets: 0, price: 0 },
      ],
    });
  };

  const handleRemoveArea = (index: number) => {
    setEventData({
      ...eventData,
      areas: eventData.areas.filter((_, i) => i !== index),
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "banner"
  ) => {
    const file = e.target.files?.[0] || null;
    if (type === "image") {
      setImageFile(file);
      setImageFileName(file ? file.name : "");
    } else {
      setBannerFile(file);
      setBannerFileName(file ? file.name : "");
    }
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để tạo sự kiện.");
      return;
    }

    if (
      !eventData.name ||
      !eventData.date ||
      !eventData.time ||
      !eventData.location
    ) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    if (
      eventData.areas.some(
        (a) =>
          !a.name ||
          a.totalTickets <= 0 ||
          a.price <= 0 ||
          a.templateAreaId === 0
      )
    ) {
      toast.error("Thông tin khu vực không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    if (eventData.areas.length > templateAreas.length) {
      toast.error(
        `Số khu vực vượt quá giới hạn. Template chỉ hỗ trợ tối đa ${templateAreas.length} khu vực.`
      );
      return;
    }

    const formData = new FormData();
    formData.append(
      "event",
      new Blob([JSON.stringify(eventData)], { type: "application/json" })
    );
    if (imageFile) formData.append("image", imageFile);
    if (bannerFile) formData.append("banner", bannerFile);

    try {
      const resp = await axios.post(
        "http://localhost:8085/api/organizer/events",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        `Sự kiện đã được tạo thành công với ID: ${resp.data.eventId}`
      );

      setEventData(initialEventData);
      setImageFile(null);
      setBannerFile(null);
      setImageFileName("");
      setBannerFileName("");
      const imageInput = document.getElementById(
        "image-input"
      ) as HTMLInputElement;
      const bannerInput = document.getElementById(
        "banner-input"
      ) as HTMLInputElement;
      if (imageInput) imageInput.value = "";
      if (bannerInput) bannerInput.value = "";

      setTimeout(() => {
        navigate(`/organizer/events/${resp.data.eventId}/phase`);
      }, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(
        msg.includes("template_area_id không hợp lệ")
          ? "Khu vực template không tồn tại. Vui lòng chọn lại."
          : `Có lỗi xảy ra: ${msg}`
      );
    }
  };

  const handleCancel = () => {
    setEventData(initialEventData);
    setImageFile(null);
    setBannerFile(null);
    setImageFileName("");
    setBannerFileName("");
    const imageInput = document.getElementById(
      "image-input"
    ) as HTMLInputElement;
    const bannerInput = document.getElementById(
      "banner-input"
    ) as HTMLInputElement;
    if (imageInput) imageInput.value = "";
    if (bannerInput) bannerInput.value = "";
    navigate("/organizer/events");
  };

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer />
      {/* Breadcrumb */}
      <nav className="p-6 flex items-center text-sm text-gray-500 space-x-2">
        <Link to="/organizer" className="hover:underline text-blue-600">
          Home
        </Link>
        <span>&gt;</span>
        <Link to="/organizer/events" className="hover:underline text-blue-600">
          Event
        </Link>
        <span>&gt;</span>
        <span className="text-gray-700 font-semibold">Create Event</span>
      </nav>

      {/* Steps */}
      <div className="px-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              1
            </div>
            <span className="ml-2 text-gray-600">Tạo sự kiện</span>
          </div>
          <div className="w-40 h-0.5 bg-gray-300 mx-2"></div>
          <div className="flex items-center">
            <div className="bg-gray-300 text-gray-600 rounded-full w-8 h-8 flex items-center justify-center">
              2
            </div>
            <span className="ml-2 text-gray-400">Tạo phiên bán vé</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Tạo Sự Kiện Mới
        </h2>

        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Danh mục
              </label>
              <select
                name="categoryId"
                value={eventData.categoryId}
                onChange={handleInputChange}
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={0}>Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên sự kiện
              </label>
              <input
                type="text"
                name="name"
                value={eventData.name}
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
              value={eventData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày
              </label>
              <input
                type="date"
                name="date"
                value={eventData.date}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Thời gian
              </label>
              <input
                type="time"
                name="time"
                value={eventData.time}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Địa điểm
            </label>
            <input
              type="text"
              name="location"
              value={eventData.location}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Template bản đồ
            </label>
            <select
              name="mapTemplateId"
              value={eventData.mapTemplateId}
              onChange={handleInputChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={0}>Chọn template</option>
              {mapTemplates.map((t) => (
                <option key={t.templateId} value={t.templateId}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Khu vực
            </h3>
            {eventData.areas.map((area, idx) => (
              <div
                key={idx}
                className="mb-4 p-4 border border-gray-300 rounded-md"
              >
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tên khu vực
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Tên khu vực"
                      value={area.name}
                      onChange={(e) => handleInputChange(e, idx)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Khu vực template
                    </label>
                    <select
                      name="templateAreaId"
                      value={area.templateAreaId}
                      onChange={(e) => handleInputChange(e, idx)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={0}>Chọn khu vực</option>
                      {templateAreas.map((ta) => (
                        <option
                          key={ta.templateAreaId}
                          value={ta.templateAreaId}
                        >
                          {ta.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tổng số vé
                    </label>
                    <input
                      type="number"
                      name="totalTickets"
                      placeholder="Tổng số vé"
                      value={area.totalTickets}
                      onChange={(e) => handleInputChange(e, idx)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Giá vé
                    </label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Giá vé"
                      value={area.price}
                      onChange={(e) => handleInputChange(e, idx)}
                      className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                    />
                  </div>
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

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hình ảnh
              </label>
              <div className="mt-1 relative">
                <input
                  id="image-input"
                  type="file"
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
              <label className="block text-sm font-medium text-gray-700">
                Banner
              </label>
              <div className="mt-1 relative">
                <input
                  id="banner-input"
                  type="file"
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
              Tạo sự kiện
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerCreateEvent;
