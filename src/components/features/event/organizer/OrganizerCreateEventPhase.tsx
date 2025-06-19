import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link, useParams } from "react-router-dom";
import { BASE_URL } from "../../../../utils/const";

interface Area {
  areaId: number;
  name: string;
  price: number;
  totalTickets: number;
  availableTickets: number;
}

interface Phase {
  startTime: string;
  endTime: string;
  ticketsAvailable: number;
  areaId: number;
}

// Định nghĩa các endpoint rõ ràng
const ORGANIZER_EVENT_AREAS_ENDPOINT = (eventId: string) =>
  `${BASE_URL}/api/organizer/events/${eventId}/areas`;
const ORGANIZER_EVENT_PHASES_ENDPOINT = (eventId: string) =>
  `${BASE_URL}/api/organizer/events/${eventId}/phases`;

const CreateEventOrganizerPhase: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [areas, setAreas] = useState<Area[]>([]);
  const [phases, setPhases] = useState<Phase[]>([
    { startTime: "", endTime: "", ticketsAvailable: 0, areaId: 0 },
  ]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          ORGANIZER_EVENT_AREAS_ENDPOINT(eventId || ""),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAreas(response.data.data);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        toast.error(`Error loading area list: ${msg}`);
      }
    };

    fetchAreas();
  }, [eventId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedPhases = [...phases];
    updatedPhases[index] = {
      ...updatedPhases[index],
      [name]:
        name === "ticketsAvailable" || name === "areaId"
          ? parseInt(value) || 0
          : value,
    };
    setPhases(updatedPhases);
  };

  const handleAddPhase = () => {
    setPhases([
      ...phases,
      { startTime: "", endTime: "", ticketsAvailable: 0, areaId: 0 },
    ]);
  };

  const handleRemovePhase = (index: number) => {
    setPhases(phases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to log in to create a ticket sale phase.");
      return;
    }

    if (
      phases.some(
        (p) =>
          !p.startTime || !p.endTime || p.ticketsAvailable <= 0 || p.areaId <= 0
      )
    ) {
      toast.error("Please fill in all information for all phases.");
      return;
    }

    try {
      for (const phase of phases) {
        await axios.post(
          ORGANIZER_EVENT_PHASES_ENDPOINT(eventId || ""),
          phase,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      toast.success("Ticket sale phase created successfully!");
      setTimeout(() => {
        navigate("/organizer/events");
      }, 3000);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`An error occurred: ${msg}`);
    }
  };

  const handleCancel = () => {
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
        <Link
          to={`/organizer/events/create`}
          className="hover:underline text-blue-600"
        >
          Create Event
        </Link>
        <span>&gt;</span>
        <span className="text-gray-700 font-semibold">Create Event Phase</span>
      </nav>

      {/* Steps */}
      <div className="px-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              1
            </div>
            <span className="ml-2 text-gray-600">Create Event</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-300"></div>
          <div className="flex items-center">
            <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
              2
            </div>
            <span className="ml-2 text-gray-600">Create Ticket Sale Phase</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Create Ticket Sale Phase
        </h2>

        <form className="space-y-6">
          {phases.map((phase, idx) => (
            <div
              key={idx}
              className="mb-4 p-4 border border-gray-300 rounded-md"
            >
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Area
                  </label>
                  <select
                    name="areaId"
                    value={phase.areaId}
                    onChange={(e) => handleInputChange(e, idx)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Select area</option>
                    {areas.map((area) => (
                      <option key={area.areaId} value={area.areaId}>
                        {area.name} - {area.price.toLocaleString("en-US")} VND
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={phase.startTime}
                    onChange={(e) => handleInputChange(e, idx)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={phase.endTime}
                    onChange={(e) => handleInputChange(e, idx)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ticket Quantity
                  </label>
                  <input
                    type="number"
                    name="ticketsAvailable"
                    value={phase.ticketsAvailable}
                    onChange={(e) => handleInputChange(e, idx)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemovePhase(idx)}
                className="mt-2 text-red-600 hover:text-red-800"
              >
                Remove Phase
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={handleAddPhase}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Add Phase
          </button>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Ticket Sale Phase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventOrganizerPhase;
