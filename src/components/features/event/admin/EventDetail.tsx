import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import TicketSalePhases from "./TicketSalePhases";
import MapVisual from "./EventMapVisual";
import EventAreas from "./EventAreas";
import { FaChevronDown } from "react-icons/fa";
import Swal from "sweetalert2";
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
}

interface MapTemplate {
  templateId: number;
  name: string;
}

interface Phase {
  phaseId: number;
  eventId: number;
  areaId: number;
  areaName: string;
  startTime: string;
  endTime: string;
  ticketsAvailable: number;
  status: string;
  message: string | null;
}

interface EditablePhase {
  phaseId: number;
  startTime: string;
  endTime: string;
  ticketsAvailable: number;
  areaId: number;
}

// Định nghĩa các endpoint rõ ràng
const ADMIN_EVENT_DETAIL_ENDPOINT = (eventId: string) =>
  `${BASE_URL}/api/admin/events/${eventId}`;
const ADMIN_CATEGORIES_ENDPOINT = `${BASE_URL}/api/admin/categories`;
const ADMIN_MAP_TEMPLATES_ENDPOINT = `${BASE_URL}/api/admin/map-templates`;
const ADMIN_EVENT_PHASES_ENDPOINT = (eventId: string) =>
  `${BASE_URL}/api/admin/events/${eventId}/phases`;
const ADMIN_EVENT_AREAS_ENDPOINT = (eventId: string) =>
  `${BASE_URL}/api/admin/events/${eventId}/areas`;

const EventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mapTemplates, setMapTemplates] = useState<MapTemplate[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [openPhaseIndex, setOpenPhaseIndex] = useState<number | null>(null);
  const [editingPhase, setEditingPhase] = useState<EditablePhase | null>(null);
  const [, setAreas] = useState<
    Array<{ areaId: number; name: string; price: number }>
  >([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const [eventRes, catRes, mapRes, phasesRes, areasRes] =
          await Promise.all([
            axios.get<Event>(ADMIN_EVENT_DETAIL_ENDPOINT(eventId || ""), {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get<Category[]>(ADMIN_CATEGORIES_ENDPOINT, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get<MapTemplate[]>(ADMIN_MAP_TEMPLATES_ENDPOINT, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get<Phase[]>(ADMIN_EVENT_PHASES_ENDPOINT(eventId || ""), {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(ADMIN_EVENT_AREAS_ENDPOINT(eventId || ""), {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
        setEvent(eventRes.data);
        setCategories(catRes.data);
        setMapTemplates(mapRes.data);
        setPhases(phasesRes.data);
        setAreas(areasRes.data.data);
      } catch (error) {
        console.error(error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [eventId]);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  const getCategoryName = (id: number) =>
    categories.find((c) => c.categoryId === id)?.name || "Unknown";

  const getMapTemplateName = (id: number) =>
    mapTemplates.find((m) => m.templateId === id)?.name || "Unknown";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-50 border-green-400 text-green-700";
      case "pending":
        return "bg-yellow-50 border-yellow-400 text-yellow-700";
      case "rejected":
        return "bg-red-50 border-red-400 text-red-700";
      default:
        return "bg-gray-50 border-gray-400 text-gray-700";
    }
  };

  const handleDescriptionClick = () => {
    Swal.fire({
      title: "Event Description",
      html: `<div class="text-left p-4 whitespace-pre-wrap text-base leading-relaxed">${event?.description}</div>`,
      width: "1200px",
      padding: "2em",
      customClass: {
        container: "description-modal",
        popup: "description-modal-popup",
        title: "text-xl font-bold mb-4",
      },
      showCloseButton: true,
      showConfirmButton: false,
      background: "#fff",
      backdrop: `
        rgba(0,0,0,0.4)
      `,
    });
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (!event) return <div className="p-8 text-red-500">Event not found.</div>;

  return (
    <div className="bg-white min-h-screen">
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
        <span className="text-gray-700 font-semibold">Event Details</span>
      </nav>

      {/* Main content */}
      <div className="bg-white p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Event Image */}
        <img
          src={
            event.imageUrl ||
            "https://via.placeholder.com/200x120?text=No+Image"
          }
          alt="Event"
          className="w-70 md:h-auto h-full object-cover rounded-xl border md:self-stretch"
          onError={(e) =>
            (e.currentTarget.src =
              "https://via.placeholder.com/200x120?text=No+Image")
          }
        />

        {/* Event Info */}
        <div className="flex-1 flex flex-col gap-2 h-full justify-between">
          <div className="text-gray-500 text-sm font-medium">
            {event.location}
          </div>
          <div className="text-xl md:text-2xl font-bold text-black mb-1">
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

          {/* Badges */}
          <div className="flex flex-wrap gap-4 text-sm mb-2">
            <span className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-gray-700 font-semibold text-xs min-w-[100px] text-center">
              Category: <b>{getCategoryName(event.categoryId)}</b>
            </span>
            <span className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-gray-700 font-semibold text-xs min-w-[100px] text-center">
              Map Template: <b>{getMapTemplateName(event.mapTemplateId)}</b>
            </span>
            <span className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-gray-700 font-semibold text-xs min-w-[100px] text-center">
              Organizer ID: <b>{event.organizerId}</b>
            </span>
            <div
              className="bg-gray-100 border border-gray-300 px-3 py-1 rounded-full text-gray-700 font-semibold text-xs min-w-[100px] text-center cursor-pointer hover:bg-gray-200 transition-colors"
              onClick={handleDescriptionClick}
            >
              <div className="flex items-center justify-between gap-2">
                <span>Description</span>
                <FaChevronDown size={12} />
              </div>
            </div>
          </div>

          {/* Status badge dưới cùng, tách khỏi flex */}
          <div className="mt-1">
            <span
              className={`${getStatusColor(
                event.status
              )} border px-3 py-1 rounded-full font-semibold text-xs mb-2`}
            >
              Status:{" "}
              <b>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </b>
            </span>
          </div>
        </div>
      </div>

      {/* Ticket Sale Phases Section */}
      <TicketSalePhases
        eventId={eventId!}
        phases={phases}
        setPhases={setPhases}
        openPhaseIndex={openPhaseIndex}
        setOpenPhaseIndex={setOpenPhaseIndex}
        editingPhase={editingPhase}
        setEditingPhase={setEditingPhase}
      />

      {/* Areas Section */}
      <EventAreas eventId={eventId!} />

      {/* Map Visualization Section */}
      <MapVisual eventId={eventId!} mapTemplateId={event.mapTemplateId} />
    </div>
  );
};

export default EventDetail;
