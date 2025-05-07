import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaInfoCircle, FaTrash, FaPlus, FaEdit, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import Swal from "sweetalert2";
import CreateMapTemplate from "./CreateMap";
import UpdateMapTemplate from "./UpdateMap";

interface Area {
  templateAreaId: number;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MapTemplate {
  templateId: number;
  name: string;
  description: string;
  areaCount: number;
  mapWidth: number;
  mapHeight: number;
  areas: Area[];
  message: string | null;
}

const MapTemplate = () => {
  const [mapTemplates, setMapTemplates] = useState<MapTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MapTemplate | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch Map Templates
  const fetchMapTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.get<MapTemplate[]>(
        "http://localhost:8085/api/admin/map-templates",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMapTemplates(response.data);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách Map Templates:", error);
      toast.error("Đã xảy ra lỗi khi lấy danh sách Map Templates.");
    }
  };

  useEffect(() => {
    fetchMapTemplates();
  }, []);

  // Filter and Sort
  const filteredAndSortedTemplates = [...mapTemplates]
    .filter((template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortDirection === "asc" ? a.templateId - b.templateId : b.templateId - a.templateId
    );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  // Show Detail Modal
  const handleShowDetail = (template: MapTemplate) => {
    setSelectedTemplate(template);
    setShowDetailModal(true);
  };

  // Delete Map Template
  const handleDeleteTemplate = async (templateId: number) => {
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

        await axios.delete(`http://localhost:8085/api/admin/map-templates/${templateId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        setMapTemplates((prev) => prev.filter((template) => template.templateId !== templateId));
        toast.success("Xóa Map Template thành công!");
      } catch (error: any) {
        console.error("Lỗi khi xóa Map Template:", error);
        toast.error("Đã xảy ra lỗi khi xóa Map Template.");
      }
    }
  };

  // Show Update Modal
  const handleShowUpdate = (template: MapTemplate) => {
    setSelectedTemplate(template);
    setShowUpdateModal(true);
  };

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-black">Map Template Management</h3>
          <h3 className="text-l text-gray-500 mt-2">A list of map templates in the app</h3>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search map by name..."
            className="px-4 py-2 border border-gray-300 rounded-md w-64"
          />
          <button
            onClick={handleSort}
            className="px-3 py-2 rounded bg-green-500 text-white"
            title="Sắp xếp theo ID"
          >
            {sortDirection === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-500 bg-white mt-5">
        <div className="min-w-[800px]">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-300 text-gray-700 text-sm uppercase">
              <tr>
                <th className="px-3 py-3 border-b min-w-[80px]">Template ID</th>
                <th className="px-6 py-3 border-b min-w-[150px]">Tên</th>
                <th className="px-6 py-3 border-b min-w-[120px]">Mô tả</th>
                <th className="px-6 py-3 border-b min-w-[100px]">Số khu vực</th>
                <th className="px-6 py-3 border-b min-w-[100px]">Chiều rộng</th>
                <th className="px-6 py-3 border-b min-w-[100px]">Chiều cao</th>
                <th className="px-6 py-3 border-b min-w-[150px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedTemplates.length > 0 ? (
                filteredAndSortedTemplates.map((template) => (
                  <tr key={template.templateId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b">{template.templateId}</td>
                    <td className="px-6 py-4 border-b">{template.name}</td>
                    <td className="px-6 py-4 border-b">{template.description}</td>
                    <td className="px-6 py-4 border-b">{template.areaCount}</td>
                    <td className="px-6 py-4 border-b">{template.mapWidth}</td>
                    <td className="px-6 py-4 border-b">{template.mapHeight}</td>
                    <td className="px-6 py-4 border-b text-center space-x-2">
                      <button
                        onClick={() => handleShowUpdate(template)}
                        className="bg-sky-500 text-white px-3 py-2 rounded hover:bg-sky-600"
                        title="Chỉnh sửa"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleShowDetail(template)}
                        className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
                        title="Chi tiết"
                      >
                        <FaInfoCircle />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.templateId)}
                        className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Không có Map Templates nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nút thêm Map Template */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:bg-yellow-600"
        title="Thêm Map Template"
      >
        <FaPlus />
      </button>

      {/* Modal chi tiết Map Template */}
      {showDetailModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl">
            <h3 className="text-2xl font-semibold mb-4 text-indigo-700 border-b pb-2">
              📄 Chi tiết Map Template
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div><strong>Template ID:</strong> {selectedTemplate.templateId}</div>
              <div><strong>Tên:</strong> {selectedTemplate.name}</div>
              <div><strong>Mô tả:</strong> {selectedTemplate.description}</div>
              <div><strong>Số khu vực:</strong> {selectedTemplate.areaCount}</div>
              <div><strong>Chiều rộng:</strong> {selectedTemplate.mapWidth}</div>
              <div><strong>Chiều cao:</strong> {selectedTemplate.mapHeight}</div>
              <div className="md:col-span-2">
                <strong>Danh sách khu vực:</strong>
                {selectedTemplate.areas.length > 0 ? (
                  <table className="w-full mt-2 border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        <th className="px-4 py-2 border-b">ID</th>
                        <th className="px-4 py-2 border-b">Tên</th>
                        <th className="px-4 py-2 border-b">X</th>
                        <th className="px-4 py-2 border-b">Y</th>
                        <th className="px-4 py-2 border-b">Chiều rộng</th>
                        <th className="px-4 py-2 border-b">Chiều cao</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedTemplate.areas.map((area) => (
                        <tr key={area.templateAreaId} className="text-left">
                          <td className="px-4 py-2 border-b">{area.templateAreaId}</td>
                          <td className="px-4 py-2 border-b">{area.name}</td>
                          <td className="px-4 py-2 border-b">{area.x}</td>
                          <td className="px-4 py-2 border-b">{area.y}</td>
                          <td className="px-4 py-2 border-b">{area.width}</td>
                          <td className="px-4 py-2 border-b">{area.height}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-gray-500 mt-2">Không có khu vực.</p>
                )}
              </div>
              {selectedTemplate.message && (
                <div className="md:col-span-2 text-red-500">
                  <strong>Thông báo:</strong> {selectedTemplate.message}
                </div>
              )}
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

      {/* Modal thêm Map Template */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl relative">
            <CreateMapTemplate
              onMapCreated={(success: boolean) => {
                setShowCreateModal(false);
                if (success) {
                  fetchMapTemplates();
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa Map Template */}
      {showUpdateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl">
            <UpdateMapTemplate
              template={selectedTemplate}
              onUpdate={(success: boolean) => {
                setShowUpdateModal(false);
                if (success) {
                  fetchMapTemplates(); // Làm mới danh sách khi cập nhật thành công
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MapTemplate;