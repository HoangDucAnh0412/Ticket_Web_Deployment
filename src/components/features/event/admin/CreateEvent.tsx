import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "../../../../utils/const";

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

interface Vertex {
  x: number;
  y: number;
}

interface TemplateArea {
  templateAreaId: number;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  vertices?: Vertex[];
  zone?: string;
  fillColor?: string;
  stage: boolean;
}

interface MapTemplate {
  templateId: number;
  name: string;
  description: string;
  areaCount: number;
  mapWidth: number;
  mapHeight: number;
  areas: TemplateArea[];
}

// Định nghĩa các endpoint rõ ràng
const ADMIN_CATEGORIES_ENDPOINT = `${BASE_URL}/api/admin/categories`;
const ADMIN_MAP_TEMPLATES_ENDPOINT = `${BASE_URL}/api/admin/map-templates`;
const ADMIN_MAP_TEMPLATE_DETAIL_ENDPOINT = (templateId: number) =>
  `${BASE_URL}/api/admin/map-templates/${templateId}`;
const ADMIN_EVENTS_ENDPOINT = `${BASE_URL}/api/admin/events`;

const CreateEvent: React.FC = () => {
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
    { templateId: number; name: string }[]
  >([]);
  const [templateAreas, setTemplateAreas] = useState<TemplateArea[]>([]);
  const [selectedMapTemplate, setSelectedMapTemplate] =
    useState<MapTemplate | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [selectedAreaIds, setSelectedAreaIds] = useState<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Bạn cần đăng nhập để tạo sự kiện.");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    const fetchCategories = axios.get(ADMIN_CATEGORIES_ENDPOINT, { headers });
    const fetchMapTemplates = axios.get(ADMIN_MAP_TEMPLATES_ENDPOINT, {
      headers,
    });

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
      setSelectedMapTemplate(null);
      return;
    }
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get<MapTemplate>(
        ADMIN_MAP_TEMPLATE_DETAIL_ENDPOINT(eventData.mapTemplateId),
        {
          headers,
        }
      )
      .then((resp) => {
        setTemplateAreas(resp.data.areas || []);
        setSelectedMapTemplate(resp.data);

        // Automatically add stage areas to the event data
        const stageAreas = resp.data.areas.filter((area) => area.stage);
        if (stageAreas.length > 0) {
          const newAreas = stageAreas.map((area) => ({
            name: area.name,
            templateAreaId: area.templateAreaId,
            totalTickets: 0,
            price: 0,
          }));
          setEventData((prev) => ({
            ...prev,
            areas: newAreas,
          }));
        }
      })
      .catch((err) =>
        toast.error(`Không thể tải danh sách khu vực: ${err.message}`)
      );
  }, [eventData.mapTemplateId]);

  // Draw map preview
  const drawMapPreview = () => {
    if (!selectedMapTemplate || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size - extra large for clear visibility
    const maxSize = 1200;
    const scale = Math.min(
      maxSize / selectedMapTemplate.mapWidth,
      maxSize / selectedMapTemplate.mapHeight
    );
    canvas.width = selectedMapTemplate.mapWidth * scale;
    canvas.height = selectedMapTemplate.mapHeight * scale;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw map outline
    ctx.strokeStyle = "#2d3748";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Draw areas
    selectedMapTemplate.areas.forEach((area) => {
      if (area.vertices && area.vertices.length > 0) {
        ctx.beginPath();
        ctx.moveTo(area.vertices[0].x * scale, area.vertices[0].y * scale);
        for (let i = 1; i < area.vertices.length; i++) {
          ctx.lineTo(area.vertices[i].x * scale, area.vertices[i].y * scale);
        }
        ctx.closePath();

        // Check if this area is selected
        const isSelected = selectedAreaIds.includes(area.templateAreaId);

        // Enhanced colors with selection highlight
        if (isSelected) {
          ctx.fillStyle = "#fbbf24"; // Bright yellow for selected areas
          ctx.strokeStyle = "#f59e0b";
          ctx.lineWidth = 3;
        } else {
          ctx.fillStyle = area.fillColor || "#e2e8f0";
          ctx.strokeStyle = "#4a5568";
          ctx.lineWidth = 2;
        }
        ctx.fill();
        ctx.stroke();

        // Enhanced text rendering
        if (area.vertices.length > 2) {
          // Calculate centroid more accurately
          let cx = 0,
            cy = 0,
            area_calc = 0;
          for (let i = 0; i < area.vertices.length; i++) {
            const j = (i + 1) % area.vertices.length;
            const cross =
              area.vertices[i].x * area.vertices[j].y -
              area.vertices[j].x * area.vertices[i].y;
            area_calc += cross;
            cx += (area.vertices[i].x + area.vertices[j].x) * cross;
            cy += (area.vertices[i].y + area.vertices[j].y) * cross;
          }
          area_calc *= 0.5;
          cx = (cx / (6 * area_calc)) * scale;
          cy = (cy / (6 * area_calc)) * scale;

          // Calculate bounding box of the area
          let minX = Math.min(...area.vertices.map((v) => v.x)) * scale;
          let maxX = Math.max(...area.vertices.map((v) => v.x)) * scale;
          let minY = Math.min(...area.vertices.map((v) => v.y)) * scale;
          let maxY = Math.max(...area.vertices.map((v) => v.y)) * scale;

          const areaWidth = maxX - minX;
          const areaHeight = maxY - minY;

          // Calculate appropriate font size based on area dimensions
          const textWidth = ctx.measureText(area.name).width;
          const maxFontSize = Math.min(
            Math.floor((areaWidth * 0.7) / (area.name.length * 0.5)), // Estimate width per character
            Math.floor(areaHeight * 0.3), // Height constraint
            20 // Maximum font size - increased for better visibility
          );
          const fontSize = Math.max(10, maxFontSize); // Minimum font size

          ctx.font = `bold ${fontSize}px 'Segoe UI', Arial, sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          // Check if text fits in area, if not, truncate or use smaller font
          const actualTextWidth = ctx.measureText(area.name).width;
          let displayText = area.name;

          if (actualTextWidth > areaWidth * 0.9) {
            // Try to truncate text if it's too long
            let truncatedText = area.name;
            while (
              ctx.measureText(truncatedText + "...").width > areaWidth * 0.9 &&
              truncatedText.length > 3
            ) {
              truncatedText = truncatedText.slice(0, -1);
            }
            if (truncatedText.length > 3) {
              displayText = truncatedText + "...";
            } else {
              // Use a smaller font size
              const smallerFontSize = Math.max(6, fontSize - 2);
              ctx.font = `bold ${smallerFontSize}px 'Segoe UI', Arial, sans-serif`;
            }
          }

          // Only draw text if area is large enough
          if (areaWidth > 30 && areaHeight > 20) {
            // Text shadow for better readability
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
            ctx.fillText(displayText, cx + 1, cy + 1);

            // Main text
            ctx.fillStyle = "#1a202c";
            ctx.fillText(displayText, cx, cy);
          }
        }
      }
    });
  };

  // Effect to update selected area IDs
  useEffect(() => {
    const selectedIds = eventData.areas
      .filter((area) => area.templateAreaId !== 0)
      .map((area) => area.templateAreaId);
    setSelectedAreaIds(selectedIds);
  }, [eventData.areas]);

  // Effect to draw map when template changes or selection changes
  useEffect(() => {
    if (selectedMapTemplate) {
      setTimeout(drawMapPreview, 100);
    }
  }, [selectedMapTemplate, selectedAreaIds]);

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

      // Find selected area and auto-fill name
      const selectedArea = templateAreas.find(
        (ta) => ta.templateAreaId === selectedAreaId
      );

      if (selectedArea) {
        const updated = [...eventData.areas];
        updated[index] = {
          ...updated[index],
          [name]: parsedValue,
          name: selectedArea.name, // Auto-fill area name
        } as Area;

        // Check if selected area is a Stage area
        if (selectedArea.name.toLowerCase().startsWith("stage")) {
          updated[index].totalTickets = 0;
          updated[index].price = 0;
        }

        setEventData({ ...eventData, areas: updated });
        return;
      }
    }

    if (index !== undefined && name === "totalTickets") {
      const selectedArea = templateAreas.find(
        (ta) => ta.templateAreaId === eventData.areas[index].templateAreaId
      );
      if (selectedArea && selectedArea.name.toLowerCase().startsWith("stage")) {
        toast.error("Không thể thay đổi số lượng vé cho khu vực Stage.");
        return;
      }
      const tickets = parseFloat(value);
      if (tickets <= 0) {
        toast.error("Tổng số vé phải lớn hơn 0.");
        return;
      }
    }

    if (index !== undefined && name === "price") {
      const selectedArea = templateAreas.find(
        (ta) => ta.templateAreaId === eventData.areas[index].templateAreaId
      );
      if (selectedArea && selectedArea.name.toLowerCase().startsWith("stage")) {
        toast.error("Không thể thay đổi giá vé cho khu vực Stage.");
        return;
      }
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

    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);

      if (type === "image") {
        setImageFile(file);
        setImageFileName(file.name);
        setImagePreview(previewUrl);
      } else {
        setBannerFile(file);
        setBannerFileName(file.name);
        setBannerPreview(previewUrl);
      }
    } else {
      if (type === "image") {
        setImageFile(null);
        setImageFileName("");
        setImagePreview(null);
      } else {
        setBannerFile(null);
        setBannerFileName("");
        setBannerPreview(null);
      }
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
      eventData.areas.some((a) => {
        // Skip validation for Stage areas
        const selectedArea = templateAreas.find(
          (ta) => ta.templateAreaId === a.templateAreaId
        );
        const isStageArea = selectedArea?.name
          .toLowerCase()
          .startsWith("stage");

        if (isStageArea) {
          return !a.name || a.templateAreaId === 0;
        }

        return (
          !a.name ||
          a.totalTickets <= 0 ||
          a.price <= 0 ||
          a.templateAreaId === 0
        );
      })
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
      const resp = await axios.post(ADMIN_EVENTS_ENDPOINT, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
        navigate(`/dashboard/event/${resp.data.eventId}/phase`);
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
    // Cleanup preview URLs
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);

    setEventData(initialEventData);
    setImageFile(null);
    setBannerFile(null);
    setImageFileName("");
    setBannerFileName("");
    setImagePreview(null);
    setBannerPreview(null);

    const imageInput = document.getElementById(
      "image-input"
    ) as HTMLInputElement;
    const bannerInput = document.getElementById(
      "banner-input"
    ) as HTMLInputElement;
    if (imageInput) imageInput.value = "";
    if (bannerInput) bannerInput.value = "";
    navigate("/dashboard/event");
  };

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer />
      {/* Breadcrumb */}
      <nav className="p-6 flex items-center text-sm text-gray-500 space-x-2">
        <Link to="/dashboard" className="hover:underline text-blue-600">
          Home
        </Link>
        <span>&gt;</span>
        <Link to="/dashboard/event" className="hover:underline text-blue-600">
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
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Template bản đồ
            </label>
            <div className="space-y-6">
              {/* Template Selection */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <select
                    name="mapTemplateId"
                    value={eventData.mapTemplateId}
                    onChange={handleInputChange}
                    className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  >
                    <option value={0}>Chọn template bản đồ</option>
                    {mapTemplates.map((t) => (
                      <option key={t.templateId} value={t.templateId}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedMapTemplate && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-base text-gray-800 mb-2">
                      📍 {selectedMapTemplate.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Mô tả:</span>
                        <p className="font-medium text-gray-800">
                          {selectedMapTemplate.description || "Không có mô tả"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Kích thước:</span>
                        <p className="font-medium text-gray-800">
                          {selectedMapTemplate.mapWidth} ×{" "}
                          {selectedMapTemplate.mapHeight}px
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Số khu vực:</span>
                        <p className="font-medium text-gray-800">
                          {selectedMapTemplate.areaCount} khu vực
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Trạng thái:</span>
                        <p className="font-medium text-green-600">✓ Sẵn sàng</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Map Preview - Full Width */}
              {selectedMapTemplate && (
                <div className="w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
                    <h4 className="font-medium text-lg text-gray-800">
                      🗺️ Preview Bản Đồ (Kích thước lớn)
                    </h4>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-200 border border-gray-400 rounded mr-2"></div>
                        <span className="text-gray-600">Chưa chọn</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-4 h-4 bg-yellow-400 border-2 border-yellow-600 rounded mr-2"></div>
                        <span className="text-gray-600">Đã chọn</span>
                      </div>
                    </div>
                  </div>
                  <div className="border-2 border-gray-300 rounded-xl p-8 bg-white shadow-lg">
                    <div className="flex justify-center overflow-auto">
                      <canvas
                        ref={canvasRef}
                        className="max-w-full h-auto rounded-lg shadow-lg border border-gray-200"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "800px",
                          minHeight: "400px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Khu vực
            </h3>
            {eventData.areas.map((area, idx) => {
              const selectedTemplateArea = templateAreas.find(
                (ta) => ta.templateAreaId === area.templateAreaId
              );
              const isStageArea = selectedTemplateArea?.stage;

              return (
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
                        disabled={isStageArea}
                        className={`mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 ${
                          isStageArea ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
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
                        disabled={isStageArea}
                        className={`mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 ${
                          isStageArea ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>
                  </div>
                  {!isStageArea && (
                    <button
                      type="button"
                      onClick={() => handleRemoveArea(idx)}
                      className="mt-2 text-red-600 hover:text-red-800"
                    >
                      Xóa khu vực
                    </button>
                  )}
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleAddArea}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Thêm khu vực
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Media Files
            </label>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Image Upload */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">
                  🖼️ Hình Ảnh Sự Kiện
                </h4>
                <div className="relative">
                  <input
                    id="image-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "image")}
                    className="hidden"
                  />
                  <label
                    htmlFor="image-input"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {imagePreview ? (
                      <div className="relative w-full h-full">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <div className="flex flex-col items-center space-y-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setShowImageModal(true);
                              }}
                              className="bg-white text-gray-800 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100"
                            >
                              Xem full size
                            </button>
                            <span className="text-white text-xs">
                              Click để thay đổi
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span className="text-gray-600 text-sm">
                          Chọn hình ảnh
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                {imageFileName && (
                  <p className="text-xs text-gray-600 truncate">
                    📎 {imageFileName}
                  </p>
                )}
              </div>

              {/* Banner Upload */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800">🎬 Banner/Video</h4>
                <div className="relative">
                  <input
                    id="banner-input"
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => handleFileChange(e, "banner")}
                    className="hidden"
                  />
                  <label
                    htmlFor="banner-input"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    {bannerPreview ? (
                      <div className="relative w-full h-full">
                        {bannerFile?.type.startsWith("video/") ? (
                          <video
                            src={bannerPreview}
                            className="w-full h-full object-cover rounded-lg"
                            controls
                            muted
                          />
                        ) : (
                          <>
                            <img
                              src={bannerPreview}
                              alt="Banner Preview"
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <div className="flex flex-col items-center space-y-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setShowBannerModal(true);
                                  }}
                                  className="bg-white text-gray-800 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100"
                                >
                                  Xem full size
                                </button>
                                <span className="text-white text-xs">
                                  Click để thay đổi
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          className="mx-auto h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-gray-600 text-sm">
                          Chọn banner/video
                        </span>
                      </div>
                    )}
                  </label>
                </div>
                {bannerFileName && (
                  <p className="text-xs text-gray-600 truncate">
                    📎 {bannerFileName}
                  </p>
                )}
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

      {/* Image Modal */}
      {showImageModal && imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-opacity z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <img
              src={imagePreview}
              alt="Full Size Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {imageFileName}
            </div>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && bannerPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setShowBannerModal(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-opacity z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            {bannerFile?.type.startsWith("video/") ? (
              <video
                src={bannerPreview}
                className="max-w-full max-h-full object-contain rounded-lg"
                controls
                autoPlay
              />
            ) : (
              <img
                src={bannerPreview}
                alt="Full Size Banner Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
            )}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              {bannerFileName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateEvent;
