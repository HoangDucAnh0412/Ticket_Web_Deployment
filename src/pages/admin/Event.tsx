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
import { useNavigate, Link } from "react-router-dom";

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
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [sortField, setSortField] = useState<"eventId" | "dateTime">("eventId");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 10;
  const navigate = useNavigate();

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

    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((event) => event.status === filterStatus);
    }

    filtered.sort((a, b) => {
      if (sortField === "eventId") {
        return sortDirection === "asc"
          ? a.eventId - b.eventId
          : b.eventId - a.eventId;
      } else {
        const aDateTime = `${a.date} ${a.time}`;
        const bDateTime = `${b.date} ${b.time}`;
        return sortDirection === "asc"
          ? aDateTime.localeCompare(bDateTime)
          : bDateTime.localeCompare(aDateTime);
      }
    });

    setFilteredEvents(filtered);
    setCurrentPage(1);
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

        await axios.delete(
          `http://localhost:8085/api/admin/events/${eventId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

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
    navigate(`/dashboard/event/${event.eventId}`);
  };

  const handleShowUpdate = (event: Event) => {
    navigate(`/dashboard/event/edit/${event.eventId}`);
  };

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const renderStatusWithBackground = (status: string) => {
    let classes = "px-3 py-1 text-sm font-medium rounded-full";
    let displayStatus = status;
    switch (status.toLowerCase()) {
      case "approved":
        classes += " text-green-700 bg-green-100 border border-green-300";
        displayStatus = "Approved";
        break;
      case "pending":
        classes += " text-yellow-700 bg-yellow-100 border border-yellow-300";
        displayStatus = "Pending";
        break;
      case "rejected":
        classes += " text-red-700 bg-red-100 border border-red-300";
        displayStatus = "Rejected";
        break;
      default:
        classes += " text-gray-700 bg-gray-100 border border-gray-300";
        displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
    }
    return <span className={classes}>{displayStatus}</span>;
  };

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-black">Event Management</h3>
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
            {sortField === "eventId" && sortDirection === "asc" ? (
              <FaSortAmountUp />
            ) : (
              <FaSortAmountDown />
            )}
          </button>
          <button
            onClick={() => handleSort("dateTime")}
            className="px-3 py-2 rounded bg-amber-700 text-white"
            title="Sắp xếp theo Date & Time"
          >
            {sortField === "dateTime" && sortDirection === "asc" ? (
              <LuClockArrowUp />
            ) : (
              <LuClockArrowDown />
            )}
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
                    <td className="px-6 py-4 border-b">
                      {formatDate(event.date)}
                    </td>
                    <td className="px-6 py-4 border-b">{event.time}</td>
                    <td className="px-6 py-4 border-b">{event.location}</td>
                    <td className="px-6 py-4 border-b">
                      {renderStatusWithBackground(event.status)}
                    </td>
                    <td className="px-6 py-4 border-b text-center space-x-2">
                      <button
                        onClick={() => handleShowUpdate(event)}
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
                currentPage === page ? "bg-blue-500 text-white" : "bg-gray-300"
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

      <Link
        to="/dashboard/event/create"
        className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:bg-yellow-600"
        title="Thêm sự kiện"
      >
        <FaPlus />
      </Link>
    </div>
  );
};

export default Event;
