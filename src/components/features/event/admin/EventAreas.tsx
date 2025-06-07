import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../../../utils/const";

interface Area {
  areaId: number;
  eventId: number;
  templateAreaId: number;
  name: string;
  totalTickets: number;
  availableTickets: number;
  price: number;
}

interface EditableArea {
  areaId: number;
  name: string;
  totalTickets: number;
  price: number;
}

interface EventAreasProps {
  eventId: string;
}

// Định nghĩa các endpoint rõ ràng
const ADMIN_EVENT_AREAS_ENDPOINT = (eventId: string) =>
  `${BASE_URL}/api/admin/events/${eventId}/areas`;
const ADMIN_EVENT_AREA_UPDATE_ENDPOINT = (eventId: string, areaId: number) =>
  `${BASE_URL}/api/admin/events/${eventId}/areas/${areaId}`;
const ADMIN_EVENT_AREA_DELETE_ENDPOINT = (eventId: string, areaId: number) =>
  `${BASE_URL}/api/admin/events/${eventId}/areas/${areaId}`;

const EventAreas = ({ eventId }: EventAreasProps) => {
  const navigate = useNavigate();
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [openAreaIndex, setOpenAreaIndex] = useState<number | null>(null);
  const [editingArea, setEditingArea] = useState<EditableArea | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
          return;
        }

        const response = await axios.get(ADMIN_EVENT_AREAS_ENDPOINT(eventId), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAreas(response.data.data);
      } catch (error) {
        console.error("Error fetching areas:", error);
        toast.error("Failed to fetch area information");
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, [eventId]);

  const handleUpdateArea = (area: Area) => {
    setEditingArea({
      areaId: area.areaId,
      name: area.name,
      totalTickets: area.totalTickets,
      price: area.price,
    });
  };

  const handleCancelEdit = () => {
    setEditingArea(null);
  };

  const handleSaveUpdate = async () => {
    if (!editingArea) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
        return;
      }

      await axios.put(
        ADMIN_EVENT_AREA_UPDATE_ENDPOINT(eventId, editingArea.areaId),
        {
          name: editingArea.name,
          totalTickets: editingArea.totalTickets,
          price: editingArea.price,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Cập nhật khu vực thành công!");

      setAreas((prevAreas) =>
        prevAreas.map((area) =>
          area.areaId === editingArea.areaId
            ? {
                ...area,
                ...editingArea,
                availableTickets: area.availableTickets,
              }
            : area
        )
      );
      setEditingArea(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Có lỗi xảy ra: ${msg}`);
    }
  };

  const handleDeleteArea = async (areaId: number) => {
    const result = await Swal.fire({
      title: "Bạn có chắc muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "grey",
      cancelButtonColor: "red",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
          return;
        }

        await axios.delete(ADMIN_EVENT_AREA_DELETE_ENDPOINT(eventId, areaId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        toast.success("Xóa khu vực thành công!");
        setAreas((prevAreas) =>
          prevAreas.filter((area) => area.areaId !== areaId)
        );
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        toast.error(`Có lỗi xảy ra: ${msg}`);
      }
    }
  };

  const handleCreateNewArea = () => {
    navigate(`/dashboard/event/${eventId}/area`);
  };

  const renderAreaDetails = (area: Area) => (
    <div className="mt-2">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-gray-600 text-sm mb-1">
            Tên khu vực
          </label>
          {editingArea?.areaId === area.areaId ? (
            <input
              type="text"
              value={editingArea.name}
              onChange={(e) =>
                setEditingArea({
                  ...editingArea,
                  name: e.target.value,
                })
              }
              className="w-full px-3 py-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          ) : (
            <input
              type="text"
              value={area.name}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />
          )}
        </div>
        <div className="flex-1">
          <label className="block text-gray-600 text-sm mb-1">Tổng số vé</label>
          {editingArea?.areaId === area.areaId ? (
            <input
              type="number"
              value={editingArea.totalTickets}
              onChange={(e) =>
                setEditingArea({
                  ...editingArea,
                  totalTickets: parseInt(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          ) : (
            <input
              type="text"
              value={area.totalTickets}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />
          )}
        </div>
        <div className="flex-1">
          <label className="block text-gray-600 text-sm mb-1">
            Số vé còn lại
          </label>
          <input
            type="text"
            value={area.availableTickets}
            readOnly
            className="w-full px-3 py-2 border rounded bg-gray-100"
          />
        </div>
        <div className="flex-1">
          <label className="block text-gray-600 text-sm mb-1">Giá vé</label>
          {editingArea?.areaId === area.areaId ? (
            <input
              type="number"
              value={editingArea.price}
              onChange={(e) =>
                setEditingArea({
                  ...editingArea,
                  price: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            />
          ) : (
            <input
              type="text"
              value={area.price.toLocaleString("vi-VN") + " VND"}
              readOnly
              className="w-full px-3 py-2 border rounded bg-gray-100"
            />
          )}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        {editingArea?.areaId === area.areaId ? (
          <>
            <button
              onClick={handleSaveUpdate}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              <FaSave />
              Lưu
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              <FaTimes />
              Hủy
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => handleUpdateArea(area)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <FaEdit />
              Cập nhật
            </button>
            <button
              onClick={() => handleDeleteArea(area.areaId)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              <FaTrash />
              Xóa
            </button>
          </>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Stage Areas</h2>
        <button
          onClick={handleCreateNewArea}
          className="bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600"
        >
          <FaPlus />
        </button>
      </div>
      <div className="border border-gray-200 rounded-lg bg-gray-50">
        {/* Main Accordion Header */}
        <div
          className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-100 rounded-t-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex items-center gap-4">
            <span className="font-semibold text-base">Danh sách khu vực</span>
            <span className="text-gray-500 text-sm">
              ({areas.length} Khu vực)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`border px-3 py-1 rounded-full text-xs font-semibold ${
                areas.reduce((sum, area) => sum + area.availableTickets, 0) ===
                0
                  ? "bg-red-50 border-red-400 text-red-700"
                  : "bg-green-50 border-green-400 text-green-700"
              }`}
            >
              {areas.reduce((sum, area) => sum + area.availableTickets, 0)} Vé
              còn lại
            </span>
            {isOpen ? <FaChevronUp /> : <FaChevronDown />}
          </div>
        </div>
        {/* Main Accordion Content */}
        {isOpen && (
          <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
            <div className="flex flex-col gap-4">
              {areas.map((area, index) => {
                const isAreaOpen = openAreaIndex === index;
                return (
                  <div
                    key={area.areaId}
                    className="border border-gray-200 rounded-lg bg-gray-50"
                  >
                    {/* Area Accordion Header */}
                    <div
                      className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-100 rounded-t-lg"
                      onClick={() =>
                        setOpenAreaIndex(isAreaOpen ? null : index)
                      }
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-semibold text-base">
                          {area.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {area.totalTickets} Vé
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`border px-3 py-1 rounded-full text-xs font-semibold ${
                            area.availableTickets === 0
                              ? "bg-red-50 border-red-400 text-red-700"
                              : "bg-green-50 border-green-400 text-green-700"
                          }`}
                        >
                          {area.availableTickets} Vé còn lại
                        </span>
                        {isAreaOpen ? <FaChevronUp /> : <FaChevronDown />}
                      </div>
                    </div>
                    {/* Area Accordion Content */}
                    {isAreaOpen && (
                      <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
                        {renderAreaDetails(area)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default EventAreas;
