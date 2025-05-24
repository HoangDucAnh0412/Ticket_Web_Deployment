import {
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaTrash,
  FaSave,
  FaTimes,
  FaPlus,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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

interface OrganizerTicketSalePhasesProps {
  eventId: string;
  phases: Phase[];
  setPhases: React.Dispatch<React.SetStateAction<Phase[]>>;
  openPhaseIndex: number | null;
  setOpenPhaseIndex: React.Dispatch<React.SetStateAction<number | null>>;
  editingPhase: EditablePhase | null;
  setEditingPhase: React.Dispatch<React.SetStateAction<EditablePhase | null>>;
}

const OrganizerTicketSalePhases = ({
  eventId,
  phases,
  setPhases,
  openPhaseIndex,
  setOpenPhaseIndex,
  editingPhase,
  setEditingPhase,
}: OrganizerTicketSalePhasesProps) => {
  const navigate = useNavigate();

  const formatDateTime = (dateTimeStr: string) => {
    const date = new Date(dateTimeStr);
    const timePart = date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const datePart = date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    return `${timePart} - ${datePart}`;
  };

  const getPhaseStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-50 border-green-400 text-green-700";
      case "upcoming":
        return "bg-yellow-50 border-yellow-400 text-yellow-700";
      default:
        return "bg-red-50 border-red-400 text-red-700";
    }
  };

  const handleUpdatePhase = (phase: Phase) => {
    setEditingPhase({
      phaseId: phase.phaseId,
      startTime: phase.startTime,
      endTime: phase.endTime,
      ticketsAvailable: phase.ticketsAvailable,
      areaId: phase.areaId,
    });
  };

  const handleCancelEdit = () => {
    setEditingPhase(null);
  };

  const handleSaveUpdate = async () => {
    if (!editingPhase) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn cần đăng nhập để thực hiện thao tác này");
        return;
      }

      const response = await axios.put(
        `http://localhost:8085/api/organizer/events/phases/${editingPhase.phaseId}`,
        {
          startTime: editingPhase.startTime,
          endTime: editingPhase.endTime,
          ticketsAvailable: editingPhase.ticketsAvailable,
          areaId: editingPhase.areaId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Cập nhật phiên bán vé thành công!");

      // Update the specific phase in the local state without re-fetching the entire list
      setPhases((prevPhases) =>
        prevPhases.map((phase) =>
          phase.phaseId === editingPhase.phaseId
            ? {
                ...phase,
                startTime: editingPhase.startTime,
                endTime: editingPhase.endTime,
                ticketsAvailable: editingPhase.ticketsAvailable,
                areaId: editingPhase.areaId,
                status: response.data.status || phase.status,
                message: response.data.message || phase.message,
              }
            : phase
        )
      );

      setEditingPhase(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      toast.error(`Có lỗi xảy ra: ${msg}`);
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
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

        await axios.delete(
          `http://localhost:8085/api/organizer/events/phases/${phaseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Xóa phiên bán vé thành công!");

        // Refresh phases list
        const response = await axios.get(
          `http://localhost:8085/api/organizer/events/${eventId}/phases`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPhases(response.data);
        setOpenPhaseIndex(null);
      } catch (err: any) {
        const msg = err.response?.data?.message || err.message;
        toast.error(`Có lỗi xảy ra: ${msg}`);
      }
    }
  };

  const handleCreateNewPhase = () => {
    navigate(`/organizer/events/${eventId}/phase`);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Ticket Sale Phases
        </h2>
        <button
          onClick={handleCreateNewPhase}
          className="bg-yellow-500 text-white p-3 rounded-full shadow-lg hover:bg-yellow-600"
        >
          <FaPlus />
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {phases.map((phase, index) => {
          const isOpen = openPhaseIndex === index;
          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg bg-gray-50"
            >
              {/* Accordion Header */}
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-100 rounded-t-lg"
                onClick={() => setOpenPhaseIndex(isOpen ? null : index)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-base">
                    {formatDateTime(phase.startTime)}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {phase.areaName} - {phase.ticketsAvailable} Vé
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`${getPhaseStatusColor(
                      phase.status
                    )} border px-3 py-1 rounded-full text-xs font-semibold`}
                  >
                    {phase.status.charAt(0).toUpperCase() +
                      phase.status.slice(1)}
                  </span>
                  {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>
              {/* Accordion Content */}
              {isOpen && (
                <div className="bg-white px-6 py-4 border-t border-gray-200 rounded-b-lg">
                  <div className="mb-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-gray-600 text-sm mb-1">
                          Khu vực
                        </label>
                        {editingPhase?.phaseId === phase.phaseId ? (
                          <input
                            type="text"
                            value={phase.areaName}
                            readOnly
                            className="w-full px-3 py-2 border rounded bg-gray-100"
                          />
                        ) : (
                          <input
                            type="text"
                            value={phase.areaName}
                            readOnly
                            className="w-full px-3 py-2 border rounded bg-gray-100"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-600 text-sm mb-1">
                          Thời gian bắt đầu
                        </label>
                        {editingPhase?.phaseId === phase.phaseId ? (
                          <input
                            type="datetime-local"
                            value={editingPhase.startTime.slice(0, 16)}
                            onChange={(e) =>
                              setEditingPhase({
                                ...editingPhase,
                                startTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formatDateTime(phase.startTime)}
                            readOnly
                            className="w-full px-3 py-2 border rounded bg-gray-100"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-600 text-sm mb-1">
                          Thời gian kết thúc
                        </label>
                        {editingPhase?.phaseId === phase.phaseId ? (
                          <input
                            type="datetime-local"
                            value={editingPhase.endTime.slice(0, 16)}
                            onChange={(e) =>
                              setEditingPhase({
                                ...editingPhase,
                                endTime: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={formatDateTime(phase.endTime)}
                            readOnly
                            className="w-full px-3 py-2 border rounded bg-gray-100"
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-gray-600 text-sm mb-1">
                          Số lượng vé
                        </label>
                        {editingPhase?.phaseId === phase.phaseId ? (
                          <input
                            type="number"
                            value={editingPhase.ticketsAvailable}
                            onChange={(e) =>
                              setEditingPhase({
                                ...editingPhase,
                                ticketsAvailable: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        ) : (
                          <input
                            type="text"
                            value={phase.ticketsAvailable}
                            readOnly
                            className="w-full px-3 py-2 border rounded bg-gray-100"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    {editingPhase?.phaseId === phase.phaseId ? (
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
                          onClick={() => handleUpdatePhase(phase)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeletePhase(phase.phaseId)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ToastContainer />
    </div>
  );
};

export default OrganizerTicketSalePhases;
