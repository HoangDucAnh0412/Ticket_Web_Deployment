import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEdit, FaTrash, FaPlus, FaInfoCircle } from "react-icons/fa";
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

const OrganizerEvent = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeStatus, setActiveStatus] = useState("all");
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
        "http://localhost:8085/api/organizer/events",
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

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (activeStatus !== "all") {
      filtered = filtered.filter(
        (event) => event.status.toLowerCase() === activeStatus.toLowerCase()
      );
    }

    setFilteredEvents(filtered);
    setCurrentPage(1);
  }, [searchTerm, activeStatus, events]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleStatusFilter = (status: string) => {
    setActiveStatus(status);
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
          `http://localhost:8085/api/organizer/events/${eventId}`,
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
    navigate(`/organizer/events/${event.eventId}`);
  };

  const handleShowUpdate = (event: Event) => {
    navigate(`/organizer/events/${event.eventId}/edit`);
  };

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const renderStatusWithBackground = (status: string) => {
    let classes = "px-3 py-1 text-sm font-medium rounded-full";
    let displayStatus = status;
    switch (status?.toLowerCase()) {
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
        displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1);
    }
    return <span className={classes}>{displayStatus}</span>;
  };

  return (
    <div className="p-6 bg-white min-h-screen relative flex flex-col">
      <ToastContainer />
      {/* Title Section */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-black">Event Management</h3>
        <h3 className="text-l text-gray-500 mt-2">
          A list of events in the app
        </h3>
      </div>
      {/* Search (left) and Sort/Status (right) on same row */}
      <div className="flex items-center justify-between mb-6 gap-4">
        {/* Search left */}
        <div className="relative flex items-center w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search events by name..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        {/* Sort/Status right */}
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusFilter("all")}
            className={`px-4 py-2 rounded-md ${
              activeStatus === "all"
                ? "bg-gray-200 text-gray-800"
                : "bg-white text-gray-600 border border-gray-300"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleStatusFilter("approved")}
            className={`px-4 py-2 rounded-md ${
              activeStatus === "approved"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-white text-gray-600 border border-gray-300"
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => handleStatusFilter("pending")}
            className={`px-4 py-2 rounded-md ${
              activeStatus === "pending"
                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                : "bg-white text-gray-600 border border-gray-300"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => handleStatusFilter("rejected")}
            className={`px-4 py-2 rounded-md ${
              activeStatus === "rejected"
                ? "bg-red-100 text-red-800 border border-red-300"
                : "bg-white text-gray-600 border border-gray-300"
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Event List */}
      <div className="flex-1">
        <div className="flex flex-col gap-6">
          {currentEvents.length > 0 ? (
            currentEvents.map((event) => (
              <div
                key={event.eventId}
                className="flex flex-col md:flex-row bg-white-200 border-1 rounded-lg p-4 items-center md:items-stretch gap-6"
              >
                {/* Event Image */}
                <img
                  src={
                    event.imageUrl ||
                    "https://via.placeholder.com/320x192?text=No+Image"
                  }
                  alt="Event"
                  className="w-80 h-50 object-cover rounded-lg border" // Increased size from w-60 h-36 to w-80 h-48
                  onError={(e) =>
                    (e.currentTarget.src =
                      "https://via.placeholder.com/320x192?text=No+Image")
                  }
                />
                {/* Content */}
                <div className="flex-1 flex flex-col justify-between gap-2">
                  <div className="text-gray-500 text-sm font-medium">
                    {event.location}
                  </div>
                  <div className="text-xl font-bold text-black mb-1">
                    {event.name}
                  </div>
                  <div className="flex items-center gap-4 text-gray-600 text-sm mb-2">
                    <span className="flex items-center gap-1">
                      <svg
                        width="18"
                        height="18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {event.time}, {formatDate(event.date)}
                    </span>
                  </div>
                  {/* Status (no border, right below time/date) */}
                  <div className="">
                    {renderStatusWithBackground(event.status)}
                  </div>
                  {/* Action Buttons (bottom, border-top, centered) */}
                  <div className="border-t border-gray-300 mt-4 pt-3 flex justify-center gap-2">
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
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              {activeStatus === "all"
                ? "There are no events."
                : `No ${activeStatus} events found.`}
            </div>
          )}
        </div>
      </div>

      <Link
        to="/organizer/events/create"
        className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:bg-yellow-600"
        title="Thêm sự kiện"
      >
        <FaPlus />
      </Link>
    </div>
  );
};

export default OrganizerEvent;