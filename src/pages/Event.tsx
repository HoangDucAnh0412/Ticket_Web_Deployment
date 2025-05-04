import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaEdit,
  FaTrash,
  FaPlus,
  FaSortAmountDown,
  FaSortAmountUp,
  FaInfoCircle,
} from "react-icons/fa";
import { LuClockArrowDown, LuClockArrowUp } from "react-icons/lu";

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

const Event = () => {
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editEventId, setEditEventId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [categoryId, setCategoryId] = useState("");
  const [organizerId, setOrganizerId] = useState("");
  const [mapTemplateId, setMapTemplateId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [status, setStatus] = useState("approved");
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [sortField, setSortField] = useState<"eventId" | "dateTime">("eventId");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.get<Event[]>(
        "http://localhost:8085/api/admin/events",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách sự kiện:", error);
      toast.error("Đã xảy ra lỗi khi lấy danh sách sự kiện.");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];

    // Lọc theo tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Lọc theo trạng thái
    if (filterStatus !== "all") {
      filtered = filtered.filter((event) => event.status === filterStatus);
    }

    // Sắp xếp theo trường và hướng
    filtered.sort((a, b) => {
      if (sortField === "eventId") {
        return sortDirection === "asc"
          ? a.eventId - b.eventId
          : b.eventId - a.eventId;
      } else {
        // Kết hợp date và time thành chuỗi YYYY-MM-DD HH:mm
        const aDateTime = `${a.date} ${a.time}`;
        const bDateTime = `${b.date} ${b.time}`;
        return sortDirection === "asc"
          ? aDateTime.localeCompare(bDateTime)
          : bDateTime.localeCompare(aDateTime);
      }
    });

    setFilteredEvents(filtered);
    setCurrentPage(1); // Reset về trang 1 khi lọc hoặc sắp xếp
  }, [searchTerm, filterStatus, sortField, sortDirection, events]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterStatus = (status: string) => {
    setFilterStatus(status);
  };

  const handleSort = (field: "eventId" | "dateTime") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleAddEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.post<Event>(
        "http://localhost:8085/api/admin/events",
        {
          categoryId: parseInt(categoryId),
          organizerId: parseInt(organizerId),
          mapTemplateId: parseInt(mapTemplateId),
          name,
          description,
          date,
          time,
          location,
          imageUrl,
          bannerUrl,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updated = [...events, response.data];
      setEvents(updated);
      setFilteredEvents(updated);
      setShowModal(false);
      resetForm();
      toast.success("Thêm sự kiện thành công!");
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setErrorMessage(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi khi thêm sự kiện.");
        toast.error("Đã xảy ra lỗi khi thêm sự kiện.");
      }
    }
  };

  const handleEditEvent = (event: Event) => {
    setIsEditMode(true);
    setEditEventId(event.eventId);
    setCategoryId(event.categoryId.toString());
    setOrganizerId(event.organizerId.toString());
    setMapTemplateId(event.mapTemplateId.toString());
    setName(event.name);
    setDescription(event.description);
    setDate(event.date);
    setTime(event.time);
    setLocation(event.location);
    setImageUrl(event.imageUrl);
    setBannerUrl(event.bannerUrl);
    setStatus(event.status);
    setShowModal(true);
  };

  const handleUpdateEvent = async () => {
    if (editEventId === null) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.put<Event>(
        `http://localhost:8085/api/admin/events/${editEventId}`,
        {
          categoryId: parseInt(categoryId),
          organizerId: parseInt(organizerId),
          mapTemplateId: parseInt(mapTemplateId),
          name,
          description,
          date,
          time,
          location,
          imageUrl,
          bannerUrl,
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updated = events.map((event) =>
        event.eventId === editEventId ? response.data : event
      );
      setEvents(updated);
      setFilteredEvents(updated);
      setShowModal(false);
      resetForm();
      toast.success("Cập nhật sự kiện thành công!");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi khi cập nhật sự kiện.");
        toast.error("Đã xảy ra lỗi khi cập nhật sự kiện.");
      }
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc muốn xóa?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "grey",
      cancelButtonColor: "red",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Không tìm thấy token xác thực.");
          return;
        }

        await axios.delete(`http://localhost:8085/api/admin/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const updated = events.filter((event) => event.eventId !== eventId);
        setEvents(updated);
        setFilteredEvents(updated);
        toast.success("Xóa sự kiện thành công!");
      } catch (error: any) {
        console.error("Lỗi khi xóa sự kiện:", error);
        toast.error("Đã xảy ra lỗi khi xóa sự kiện.");
      }
    }
  };

  const handleShowDetail = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const resetForm = () => {
    setCategoryId("");
    setOrganizerId("");
    setMapTemplateId("");
    setName("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setImageUrl("");
    setBannerUrl("");
    setStatus("approved");
    setIsEditMode(false);
    setEditEventId(null);
    setErrorMessage("");
  };

  // Phân trang
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Hàm định dạng ngày từ YYYY-MM-DD sang DD/MM/YYYY
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  // Hàm hiển thị trạng thái với nền màu và chữ cái đầu viết hoa
  const renderStatusWithBackground = (status: string) => {
    let classes = "px-3 py-1 text-sm font-medium rounded-full";
    switch (status.toLowerCase()) {
      case "approved":
        classes += " text-green-700 bg-green-100 border border-green-300";
        status = "Approved";
        break;
      case "pending":
        classes += " text-yellow-700 bg-yellow-100 border border-yellow-300";
        status = "Pending";
        break;
      case "rejected":
        classes += " text-red-700 bg-red-100 border border-red-300";
        status = "Rejected";
        break;
      default:
        classes += " text-gray-700 bg-gray-100 border border-gray-300";
        status = status.charAt(0).toUpperCase() + status.slice(1);
    }
    return <span className={classes}>{status}</span>;
  };

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-black">
            Event Management
          </h2>
          <h3 className="text-l text-gray-500 mt-2">
            A list of events in the app
          </h3>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search events by name..."
            className="px-4 py-2 border border-gray-300 rounded-md w-64"
          />
          <select
            value={filterStatus}
            onChange={(e) => handleFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-64 sm:w-40"
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={() => handleSort("eventId")}
            className="px-3 py-2 rounded bg-green-500 text-white"
            title="Sắp xếp theo ID"
          >
            {sortField === "eventId" && sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
          <button
            onClick={() => handleSort("dateTime")}
            className="px-3 py-2 rounded bg-amber-700 text-white"
            title="Sắp xếp theo Date & Time"
          >
            {sortField === "dateTime" && sortDirection === "asc" ? <LuClockArrowUp /> : <LuClockArrowDown />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-500 bg-white mt-5">
        <div className="min-w-[800px]">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-300 text-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-3 border-b min-w-[80px]">ID</th>
                <th className="px-6 py-3 border-b min-w-[150px]">Name</th>
                <th className="px-6 py-3 border-b min-w-[120px]">Date</th>
                <th className="px-6 py-3 border-b min-w-[100px]">Time</th>
                <th className="px-6 py-3 border-b min-w-[150px]">Location</th>
                <th className="px-6 py-3 border-b min-w-[100px]">Status</th>
                <th className="px-6 py-3 border-b min-w-[150px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => (
                  <tr key={event.eventId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b">{event.eventId}</td>
                    <td className="px-6 py-4 border-b">{event.name}</td>
                    <td className="px-6 py-4 border-b">{formatDate(event.date)}</td>
                    <td className="px-6 py-4 border-b">{event.time}</td>
                    <td className="px-6 py-4 border-b">{event.location}</td>
                    <td className="px-6 py-4 border-b">{renderStatusWithBackground(event.status)}</td>
                    <td className="px-6 py-4 border-b text-center space-x-2">
                      <button
                        onClick={() => handleEditEvent(event)}
                        className="bg-sky-500 text-white px-3 py-2 rounded hover:bg-sky-600"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.eventId)}
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                      <button
                        onClick={() => handleShowDetail(event)}
                        className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
                        title="Chi tiết"
                      >
                        <FaInfoCircle />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    There are no events.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Nút thêm sự kiện */}
      <button
        onClick={() => {
          setIsEditMode(false);
          resetForm();
          setShowModal(true);
        }}
        className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:bg-yellow-600"
        title="Thêm sự kiện"
      >
        <FaPlus />
      </button>

      {/* Modal Thêm/Cập nhật sự kiện */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] p-8 rounded-lg shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditMode ? "Cập nhật sự kiện" : "Thêm sự kiện mới"}
            </h3>

            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-5 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Category ID
              </label>
              <input
                type="number"
                placeholder="Nhập ID danh mục..."
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Organizer ID
              </label>
              <input
                type="number"
                placeholder="Nhập ID nhà tổ chức..."
                value={organizerId}
                onChange={(e) => setOrganizerId(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Map Template ID
              </label>
              <input
                type="number"
                placeholder="Nhập ID mẫu bản đồ..."
                value={mapTemplateId}
                onChange={(e) => setMapTemplateId(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Tên sự kiện
              </label>
              <input
                type="text"
                placeholder="Nhập tên sự kiện..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Mô tả sự kiện
              </label>
              <textarea
                placeholder="Nhập mô tả sự kiện..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Ngày
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Giờ
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Địa điểm
              </label>
              <input
                type="text"
                placeholder="Nhập địa điểm..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                URL hình ảnh
              </label>
              <input
                type="text"
                placeholder="Nhập URL hình ảnh..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                URL banner
              </label>
              <input
                type="text"
                placeholder="Nhập URL banner..."
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              >
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={isEditMode ? handleUpdateEvent : handleAddEvent}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isEditMode ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết sự kiện */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700 border-b pb-2">
              📄 Chi tiết sự kiện
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              {/* Nhóm 1: Thông tin ID */}
              <div><strong>ID:</strong> {selectedEvent.eventId}</div>
              <div><strong>Category ID:</strong> {selectedEvent.categoryId}</div>
              <div><strong>Organizer ID:</strong> {selectedEvent.organizerId}</div>
              <div><strong>Map Template ID:</strong> {selectedEvent.mapTemplateId}</div>

              {/* Nhóm 2: Nội dung */}
              <div><strong>Name:</strong> {selectedEvent.name}</div>
              <div><strong>Date:</strong> {selectedEvent.date}</div>
              <div><strong>Time:</strong> {selectedEvent.time}</div>
              <div><strong>Location:</strong> {selectedEvent.location}</div>
              <div><strong>Status:</strong> {selectedEvent.status}</div>

              {/* Mô tả */}
              <div className="md:col-span-2">
                <strong>Description:</strong>
                <p className="mt-1 text-gray-600">{selectedEvent.description || "N/A"}</p>
              </div>

              {/* Ảnh */}
              <div className="md:col-span-2">
                <strong>Image:</strong>
                {selectedEvent.imageUrl ? (
                  <img
                    src={selectedEvent.imageUrl}
                    alt="Event"
                    className="h-48 mt-2 object-cover rounded border"
                    onError={(e) =>
                      (e.currentTarget.src = "https://via.placeholder.com/120?text=N/A")
                    }
                  />
                ) : (
                  <p className="text-gray-400">N/A</p>
                )}
              </div>

              {/* Banner URL */}
              <div className="md:col-span-2">
                <strong>Banner URL:</strong>
                <p className="text-gray-600 break-words">{selectedEvent.bannerUrl || "N/A"}</p>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Event;