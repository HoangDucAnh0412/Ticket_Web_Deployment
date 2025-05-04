import { FaEdit, FaTrash, FaPlus, FaSortAmountDown, FaSortAmountUp } from "react-icons/fa";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCategoryLogic } from "./CategoryLogic";

const Category = () => {
  const {
    showModal,
    setShowModal,
    isEditMode,
    setIsEditMode,
    name,
    setName,
    description,
    setDescription,
    categories,
    filteredCategories,
    errorMessage,
    setErrorMessage,
    sortAsc,
    searchTerm,
    setSearchTerm,
    handleSort,
    handleSearch,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  } = useCategoryLogic();

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h2 className="text-xl font-semibold text-black">
            Category management
          </h2>
          <h3 className="text-l text-gray-500 mt-2">
            A list of categories in the app including id, name, description,
            status
          </h3>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search categories..."
            className="px-4 py-2 border border-gray-300 rounded-md w-64"
          />
          <button
            onClick={handleSort}
            className="px-3 py-2 rounded bg-green-500 text-white"
            title="Sắp xếp ID"
          >
            {sortAsc ? <FaSortAmountDown /> : <FaSortAmountUp />}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-500 bg-white mt-5">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="bg-gray-300 text-gray-700 text-sm uppercase">
            <tr>
              <th className="px-6 py-3 border-b">ID</th>
              <th className="px-6 py-3 border-b">Name</th>
              <th className="px-6 py-3 border-b">Describe</th>
              <th className="px-6 py-3 border-b text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => (
                <tr key={cat.categoryId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 border-b">{cat.categoryId}</td>
                  <td className="px-6 py-4 border-b">{cat.name}</td>
                  <td className="px-6 py-4 border-b">{cat.description}</td>
                  <td className="px-6 py-4 border-b text-center space-x-2">
                    <button
                      onClick={() => handleEditCategory(cat)}
                      className="bg-sky-500 text-white px-3 py-2 rounded hover:bg-sky-600"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.categoryId)}
                      className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  There are no categories.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Nút thêm danh mục */}
      <button
        onClick={() => {
          setIsEditMode(false);
          setName("");
          setDescription("");
          setShowModal(true);
        }}
        className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:bg-yellow-600"
        title="Thêm danh mục"
      >
        <FaPlus />
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-[600px] p-8 rounded-lg shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-gray-800">
              {isEditMode ? "Cập nhật danh mục" : "Thêm danh mục mới"}
            </h3>

            {errorMessage && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-5 text-sm">
                {errorMessage}
              </div>
            )}

            <div className="mb-5">
              <label className="block text-gray-700 font-medium mb-2">
                Tên danh mục
              </label>
              <input
                type="text"
                placeholder="Nhập tên danh mục..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Mô tả danh mục
              </label>
              <textarea
                placeholder="Nhập mô tả danh mục..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border border-gray-300 px-4 py-2 rounded"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setName("");
                  setDescription("");
                  setErrorMessage("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Hủy
              </button>
              <button
                onClick={isEditMode ? handleUpdateCategory : handleAddCategory}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {isEditMode ? "Cập nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;