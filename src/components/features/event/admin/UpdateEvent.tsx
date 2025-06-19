import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BASE_URL } from "../../../../utils/const";

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

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

interface MapTemplate {
  templateId: number;
  name: string;
  description: string;
}

// Define endpoint constants
const ADMIN_EVENT_ENDPOINT = (eventId: string | number) =>
  `${BASE_URL}/api/admin/events/${eventId}`;
const ADMIN_CATEGORIES_ENDPOINT = `${BASE_URL}/api/admin/categories`;
const ADMIN_MAP_TEMPLATES_ENDPOINT = `${BASE_URL}/api/admin/map-templates`;

const UpdateEvent = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState<Partial<Event>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [bannerFileName, setBannerFileName] = useState<string>("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [mapTemplates, setMapTemplates] = useState<MapTemplate[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please log in to continue");
          navigate("/login");
          return;
        }

        // Fetch event data
        const eventResponse = await axios.get(ADMIN_EVENT_ENDPOINT(eventId!), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch categories
        const categoriesResponse = await axios.get(ADMIN_CATEGORIES_ENDPOINT, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch map templates
        const mapTemplatesResponse = await axios.get(
          ADMIN_MAP_TEMPLATES_ENDPOINT,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (eventResponse.data) {
          const eventData = eventResponse.data.data || eventResponse.data;
          setEvent(eventData);
          setFormData(eventData);
          setImageFileName(eventData.imageUrl || "");
          setBannerFileName(eventData.bannerUrl || "");
        }

        setCategories(categoriesResponse.data);
        setMapTemplates(mapTemplatesResponse.data);
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error(
          error.response?.data?.message || "Unable to load information"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "banner"
  ) => {
    const file = e.target.files?.[0] || null;
    if (type === "image") {
      setImageFile(file);
      setImageFileName(file ? file.name : event?.imageUrl || "");
    } else if (type === "banner") {
      setBannerFile(file);
      setBannerFileName(file ? file.name : event?.bannerUrl || "");
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name?.trim()) newErrors.name = "Event name is required.";
    if (!formData.date) newErrors.date = "Date is required.";
    if (!formData.time) newErrors.time = "Time is required.";
    if (!formData.location?.trim())
      newErrors.location = "Location is required.";
    if (!formData.status) newErrors.status = "Status is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found.");
        return;
      }

      const data = new FormData();
      data.append(
        "event",
        new Blob([JSON.stringify(formData)], { type: "application/json" })
      );

      if (imageFile) {
        data.append("image", imageFile);
      }
      if (bannerFile) {
        data.append("banner", bannerFile);
      }

      await axios.put(ADMIN_EVENT_ENDPOINT(eventId!), data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Event updated successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTimeout(() => {
        navigate("/dashboard/event");
      }, 2000);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật sự kiện:", error);
      const errorMessage =
        error.code === "ERR_NETWORK"
          ? `Cannot connect to server. Please check the server at ${BASE_URL}.`
          : error.response?.data?.message ||
            error.message ||
            "Unable to update event. Please check the server.";
      toast.error(`Error: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Event information not found</p>
        </div>
      </div>
    );
  }

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
        <span className="text-gray-700 font-semibold">Edit Event</span>
      </nav>

      {/* Main content */}
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Edit Event Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event ID
              </label>
              <input
                type="number"
                name="eventId"
                value={formData.eventId}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={
                  categories.find((c) => c.categoryId === formData.categoryId)
                    ?.name || ""
                }
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organizer ID
              </label>
              <input
                type="number"
                name="organizerId"
                value={formData.organizerId}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Map Template
              </label>
              <input
                type="text"
                value={
                  mapTemplates.find(
                    (m) => m.templateId === formData.mapTemplateId
                  )?.name || ""
                }
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-200 border border-gray-300 rounded-md shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.replace(
                    "Tên sự kiện là bắt buộc.",
                    "Event name is required."
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {errors.date && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date.replace(
                    "Ngày là bắt buộc.",
                    "Date is required."
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {errors.time && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.time.replace("Giờ là bắt buộc.", "Time is required.")}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              {errors.location && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.location.replace(
                    "Địa điểm là bắt buộc.",
                    "Location is required."
                  )}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status || ""}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select status</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image
              </label>
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
                    {imageFileName || "Choose image"}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Banner
              </label>
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
                    {bannerFileName || "Choose banner"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard/event")}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateEvent;
