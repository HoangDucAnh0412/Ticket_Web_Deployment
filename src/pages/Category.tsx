import { useState } from "react";
import axios from "axios";

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

const Category = () => {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddCategory = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://localhost:8085/api/admin/categories",
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const newCategory: Category = {
        categoryId: response.data.categoryId,
        name: response.data.name,
        description: response.data.description,
      };

      setCategories([...categories, newCategory]);
      setShowModal(false);
      setName("");
      setDescription("");
      setErrorMessage("");
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi khi thêm danh mục.");
      }
      console.error("Lỗi khi thêm category:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý danh mục</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + Thêm danh mục
        </button>
      </div>

      {/* Bảng danh sách danh mục */}
      <table className="w-full table-auto border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">ID</th>
            <th className="border px-4 py-2">Tên</th>
            <th className="border px-4 py-2">Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.categoryId}>
              <td className="border px-4 py-2">{cat.categoryId}</td>
              <td className="border px-4 py-2">{cat.name}</td>
              <td className="border px-4 py-2">{cat.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal thêm danh mục */}
      {showModal && (
        <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Thêm danh mục mới</h3>

            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">
                {errorMessage}
              </div>
            )}

            <input
              type="text"
              placeholder="Tên danh mục"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 mb-3 rounded"
            />
            <textarea
              placeholder="Mô tả"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border px-3 py-2 mb-3 rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setErrorMessage("");
                }}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
