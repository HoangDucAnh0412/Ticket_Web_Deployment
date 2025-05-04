import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

export const useCategoryLogic = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.get<Category[]>(
        "http://localhost:8085/api/admin/categories",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách danh mục:", error);
      toast.error("Đã xảy ra lỗi khi lấy danh sách danh mục.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [categories]);

  const handleSort = () => {
    const sorted = [...filteredCategories].sort((a, b) =>
      sortAsc ? b.categoryId - a.categoryId : a.categoryId - b.categoryId
    );
    setFilteredCategories(sorted);
    setSortAsc(!sortAsc);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCategories(filtered);
  };

  const handleAddCategory = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.post<Category>(
        "http://localhost:8085/api/admin/categories",
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
      setName("");
      setDescription("");
      setErrorMessage("");
      toast.success("Thêm danh mục thành công!");
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        setErrorMessage(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi khi thêm danh mục.");
        toast.error("Đã xảy ra lỗi khi thêm danh mục.");
      }
    }
  };

  const handleEditCategory = (category: Category) => {
    setIsEditMode(true);
    setEditCategoryId(category.categoryId);
    setName(category.name);
    setDescription(category.description);
    setShowModal(true);
  };

  const handleUpdateCategory = async () => {
    if (editCategoryId === null) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Không tìm thấy token xác thực.");
        return;
      }

      const response = await axios.put<Category>(
        `http://localhost:8085/api/admin/categories/${editCategoryId}`,
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
      setIsEditMode(false);
      setEditCategoryId(null);
      setName("");
      setDescription("");
      setErrorMessage("");
      toast.success("Cập nhật danh mục thành công!");
    } catch (error: any) {
      if (error.response && error.response.status === 400) {
        setErrorMessage(error.response.data.message);
        toast.error(error.response.data.message);
      } else {
        setErrorMessage("Đã xảy ra lỗi khi cập nhật danh mục.");
        toast.error("Đã xảy ra lỗi khi cập nhật danh mục.");
      }
    }
  };

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

        await axios.delete(
          `http://localhost:8085/api/admin/categories/${categoryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

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

  return {
    showModal,
    setShowModal,
    isEditMode,
    setIsEditMode,
    editCategoryId,
    setEditCategoryId,
    name,
    setName,
    description,
    setDescription,
    categories,
    setCategories,
    filteredCategories,
    setFilteredCategories,
    errorMessage,
    setErrorMessage,
    sortAsc,
    setSortAsc,
    searchTerm,
    setSearchTerm,
    handleSort,
    handleSearch,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
  };
};