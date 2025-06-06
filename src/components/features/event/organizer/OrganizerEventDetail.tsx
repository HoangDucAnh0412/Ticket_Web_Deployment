import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import OrganizerTicketSalePhases from "./OrganizerTicketSalePhases";
import OrganizerMapVisual from "./OrganizerEventMapVisual";
import OrganizerEventAreas from "./OrganizerEventAreas";
import OrganizerCreateArea from "./OrganizerCreateArea";

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

const OrganizerEventDetail = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mapTemplates, setMapTemplates] = useState<MapTemplate[]>([]);
  const [openPhaseIndex, setOpenPhaseIndex] = useState<number | null>(null);
  const [editingPhase, setEditingPhase] = useState<EditablePhase | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const [eventRes, phasesRes, catRes, mapRes] = await Promise.all([
          axios.get<Event>(
            `http://localhost:8085/api/organizer/events/${eventId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get<Phase[]>(
            `http://localhost:8085/api/organizer/events/${eventId}/phases`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios
            .get<Category[]>(`http://localhost:8085/api/organizer/categories`, {
              headers: { Authorization: `Bearer ${token}` },
            })
            .catch(() => ({ data: [] })),
          axios
            .get<MapTemplate[]>(
              `http://localhost:8085/api/organizer/map-templates`,
              { headers: { Authorization: `Bearer ${token}` } }
            )
            .catch(() => ({ data: [] })),
        ]);
        setEvent(eventRes.data);
        setPhases(phasesRes.data);
        setCategories(catRes.data);
        setMapTemplates(mapRes.data);
      } catch (error) {
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
    categories.find((c) => c.categoryId === id)?.name || id;

  const getMapTemplateName = (id: number) =>
    mapTemplates.find((m) => m.templateId === id)?.name || id;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (!event) return <div className="p-8 text-red-500">Event not found.</div>;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <nav className="p-6 flex items-center text-sm text-gray-500 space-x-2">
        <Link to="/organizer/events" className="hover:underline text-blue-600">
          Home
        </Link>
        <span>&gt;</span>
        <Link to="/organizer/events" className="hover:underline text-blue-600">
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
            "https://via.placeholder.com/300x120?text=No+Image"
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
      <OrganizerTicketSalePhases
        eventId={eventId || ""}
        phases={phases}
        setPhases={setPhases}
        openPhaseIndex={openPhaseIndex}
        setOpenPhaseIndex={setOpenPhaseIndex}
        editingPhase={editingPhase}
        setEditingPhase={setEditingPhase}
      />
      
      {/* Section: Event Areas for Organizer */}
      <OrganizerEventAreas eventId={eventId || ""} />

      {/* Map Visualization Section */}
      <OrganizerMapVisual
        eventId={eventId || ""}
        mapTemplateId={event.mapTemplateId}
      />
    </div>
  );
};

export default OrganizerEventDetail;
