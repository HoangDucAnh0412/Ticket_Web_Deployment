import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { BASE_URL } from "../../../utils/const";

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

const ADMIN_CATEGORIES_ENDPOINT = `${BASE_URL}/api/admin/categories`;
const ADMIN_CREATE_CATEGORY_ENDPOINT = `${BASE_URL}/api/admin/categories`;
const ADMIN_UPDATE_CATEGORY_ENDPOINT = (categoryId: number) =>
  `${BASE_URL}/api/admin/categories/${categoryId}`;
const ADMIN_DELETE_CATEGORY_ENDPOINT = (categoryId: number) =>
  `${BASE_URL}/api/admin/categories/${categoryId}`;

export const useCategoryLogic = () => {
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.get<Category[]>(ADMIN_CATEGORIES_ENDPOINT, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      toast.error("Đã xảy ra lỗi khi lấy danh sách danh mục.");
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCategories();
  }, []);

  // Search effect
  useEffect(() => {
    handleSearch(searchTerm);
  }, [categories]);

  // Sort handler
  const handleSort = () => {
    const sorted = [...filteredCategories].sort((a, b) =>
      sortAsc ? b.categoryId - a.categoryId : a.categoryId - b.categoryId
    );
    setFilteredCategories(sorted);
    setSortAsc(!sortAsc);
  };

  // Search handler
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  // Add category
  const handleAddCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.post<Category>(
        ADMIN_CREATE_CATEGORY_ENDPOINT,
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updated = [...categories, response.data];
      setCategories(updated);
      setFilteredCategories(updated);
      setShowModal(false);
      resetForm();
      toast.success("Thêm danh mục thành công!");
    } catch (error: any) {
      handleError(error, "thêm");
    }
  };

  // Edit category
  const handleEditCategory = (category: Category) => {
    setIsEditMode(true);
    setEditCategoryId(category.categoryId);
    setName(category.name);
    setDescription(category.description);
    setShowModal(true);
  };

  // Update category
  const handleUpdateCategory = async () => {
    if (editCategoryId === null) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.put<Category>(
        ADMIN_UPDATE_CATEGORY_ENDPOINT(editCategoryId),
        { name, description },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const updated = categories.map((cat) =>
        cat.categoryId === editCategoryId ? response.data : cat
      );
      setCategories(updated);
      setFilteredCategories(updated);
      setShowModal(false);
      resetForm();
      toast.success("Cập nhật danh mục thành công!");
    } catch (error: any) {
      handleError(error, "cập nhật");
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: number) => {
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

        await axios.delete(ADMIN_DELETE_CATEGORY_ENDPOINT(categoryId), {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const updated = categories.filter(
          (cat) => cat.categoryId !== categoryId
        );
        setCategories(updated);
        setFilteredCategories(updated);
        toast.success("Xóa danh mục thành công!");
      } catch (error: any) {
        console.error("Lỗi khi xóa danh mục:", error);
        toast.error("Đã xảy ra lỗi khi xóa danh mục.");
      }
    }
  };

  // Helper functions
  const resetForm = () => {
    setIsEditMode(false);
    setEditCategoryId(null);
    setName("");
    setDescription("");
    setErrorMessage("");
  };

  const handleError = (error: any, action: string) => {
    if (error.response && error.response.status === 409) {
      setErrorMessage(error.response.data.message);
      toast.error(error.response.data.message);
    } else {
      setErrorMessage(`Đã xảy ra lỗi khi ${action} danh mục.`);
      toast.error(`Đã xảy ra lỗi khi ${action} danh mục.`);
    }
  };

  return {
    // State
    categories,
    filteredCategories,
    searchTerm,
    sortAsc,
    showModal,
    isEditMode,
    name,
    description,
    errorMessage,

    // Setters
    setShowModal,
    setName,
    setDescription,
    setErrorMessage,

    // Handlers
    handleSort,
    handleSearch,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};
