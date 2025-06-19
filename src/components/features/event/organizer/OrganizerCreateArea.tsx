import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link, useParams } from "react-router-dom";
import { BASE_URL } from "../../../../utils/const";

interface Area {
  name: string;
  templateAreaId: number;
  totalTickets: number;
  price: number;
}

interface TemplateArea {
  templateAreaId: number;
  name: string;
}

// Định nghĩa các endpoint rõ ràng
const ORGANIZER_MAP_TEMPLATES_ENDPOINT = `${BASE_URL}/api/organizer/map-templates`;
const ORGANIZER_EVENT_AREAS_ENDPOINT = (eventId: string) =>
  `${BASE_URL}/api/organizer/events/${eventId}/areas`;

const OrganizerCreateArea: React.FC = () => {
  const navigate = useNavigate();
  const { eventId } = useParams<{ eventId: string }>();
  const [mapTemplates, setMapTemplates] = useState<
    { templateId: number; name: string }[]
  >([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number>(0);
  const [templateAreas, setTemplateAreas] = useState<TemplateArea[]>([]);
  const [areas, setAreas] = useState<Area[]>([
    { name: "", templateAreaId: 0, totalTickets: 0, price: 0 },
  ]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to log in to create an area.");
      return;
    }

    const headers = { Authorization: `Bearer ${token}` };
    axios
      .get(ORGANIZER_MAP_TEMPLATES_ENDPOINT, { headers })
      .then((resp) => setMapTemplates(resp.data))
      .catch((err) => toast.error(`Unable to load data: ${err.message}`));
  }, []);

  useEffect(() => {
    if (!selectedTemplateId) {
      setTemplateAreas([]);
      return;
    }

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    axios
      .get(ORGANIZER_MAP_TEMPLATES_ENDPOINT, { headers })
      .then((resp) => {
        const template = resp.data.find(
          (t: any) => t.templateId === selectedTemplateId
        );
        setTemplateAreas(template?.areas || []);
      })
      .catch((err) => toast.error(`Unable to load area list: ${err.message}`));
  }, [selectedTemplateId]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    let parsedValue: string | number = value;

    if (["templateAreaId", "totalTickets", "price"].includes(name)) {
      parsedValue = value === "" ? 0 : parseFloat(value) || 0;
    }

    if (name === "templateAreaId") {
      const selectedAreaId = parseInt(value);
      const isAreaSelected = areas.some(
        (area, i) =>
          i !== index &&
          area.templateAreaId === selectedAreaId &&
          selectedAreaId !== 0
      );
      if (isAreaSelected) {
        toast.error(
          "This area is already selected. Please select a different area."
        );
        return;
      }

      const selectedArea = templateAreas.find(
        (ta) => ta.templateAreaId === selectedAreaId
      );
      if (selectedArea && selectedArea.name.toLowerCase().startsWith("stage")) {
        const updated = [...areas];
        updated[index] = {
          ...updated[index],
          templateAreaId: selectedAreaId,
          totalTickets: 0,
          price: 0,
        };
        setAreas(updated);
        return;
      }
    }

    if (name === "totalTickets") {
      const selectedArea = templateAreas.find(
        (ta) => ta.templateAreaId === areas[index].templateAreaId
      );
      if (selectedArea && selectedArea.name.toLowerCase().startsWith("stage")) {
        toast.error("Cannot change ticket quantity for Stage area.");
        return;
      }
      const tickets = parseFloat(value);
      if (tickets <= 0) {
        toast.error("Total tickets must be greater than 0.");
        return;
      }
    }

    if (name === "price") {
      const selectedArea = templateAreas.find(
        (ta) => ta.templateAreaId === areas[index].templateAreaId
      );
      if (selectedArea && selectedArea.name.toLowerCase().startsWith("stage")) {
        toast.error("Cannot change ticket price for Stage area.");
        return;
      }
      const price = parseFloat(value);
      if (price <= 0) {
        toast.error("Ticket price must be greater than 0.");
        return;
      }
    }

    const updated = [...areas];
    updated[index] = {
      ...updated[index],
      [name]: name === "name" ? value : Number(parsedValue),
    };
    setAreas(updated);
  };

  const handleAddArea = () => {
    if (areas.length >= templateAreas.length) {
      toast.error(
        `Cannot add more areas. Template supports a maximum of ${templateAreas.length} areas.`
      );
      return;
    }

    setAreas([
      ...areas,
      { name: "", templateAreaId: 0, totalTickets: 0, price: 0 },
    ]);
  };

  const handleRemoveArea = (index: number) => {
    setAreas(areas.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("You need to log in to create an area.");
      return;
    }

    if (
      areas.some((a) => {
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
      toast.error("Invalid area information. Please check again.");
      return;
    }

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      for (const area of areas) {
        await axios.post(ORGANIZER_EVENT_AREAS_ENDPOINT(eventId || ""), area, {
          headers,
        });
      }

      toast.success("Area creation successful!");
      navigate(`/organizer/events/${eventId}`);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`An error occurred: ${msg}`);
    }
  };

  const handleCancel = () => {
    navigate(`/organizer/events/${eventId}`);
  };

  return (
    <div className="bg-white min-h-screen">
      <ToastContainer />
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
        <span className="text-gray-700 font-semibold">Create Area</span>
      </nav>

      {/* Main content */}
      <div className="px-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Create New Area
        </h2>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Map Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(Number(e.target.value))}
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value={0}>Select template</option>
              {mapTemplates.map((t) => (
                <option key={t.templateId} value={t.templateId}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Area</h3>
            {areas.map((area, idx) => {
              const selectedTemplateArea = templateAreas.find(
                (ta) => ta.templateAreaId === area.templateAreaId
              );
              const isStageArea = selectedTemplateArea?.name
                .toLowerCase()
                .startsWith("stage");

              return (
                <div
                  key={idx}
                  className="mb-4 p-4 border border-gray-300 rounded-md"
                >
                  <div className="grid md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Area Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Area Name"
                        value={area.name}
                        onChange={(e) => handleInputChange(e, idx)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Area Template
                      </label>
                      <select
                        name="templateAreaId"
                        value={area.templateAreaId}
                        onChange={(e) => handleInputChange(e, idx)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value={0}>Select area</option>
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
                        Total Tickets
                      </label>
                      <input
                        type="number"
                        name="totalTickets"
                        placeholder="Total Tickets"
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
                        Ticket Price
                      </label>
                      <input
                        type="number"
                        name="price"
                        placeholder="Ticket Price"
                        value={area.price}
                        onChange={(e) => handleInputChange(e, idx)}
                        disabled={isStageArea}
                        className={`mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-500 ${
                          isStageArea ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveArea(idx)}
                    className="mt-2 text-red-600 hover:text-red-800"
                  >
                    Remove Area
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={handleAddArea}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Area
            </button>
          </div>

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
              Create Area
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrganizerCreateArea;
