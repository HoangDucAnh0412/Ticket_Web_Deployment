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
        toast.error("No authentication token found.");
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
      console.error("Error fetching category list:", error);
      toast.error("An error occurred while fetching category list.");
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
        toast.error("No authentication token found.");
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
      toast.success("Category added successfully!");
    } catch (error: any) {
      handleError(error, "add");
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
        toast.error("No authentication token found.");
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
      toast.success("Category updated successfully!");
    } catch (error: any) {
      handleError(error, "update");
    }
  };

  // Delete category
  const handleDeleteCategory = async (categoryId: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure you want to delete?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "grey",
      cancelButtonColor: "red",
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("No authentication token found.");
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
        toast.success("Category deleted successfully!");
      } catch (error: any) {
        console.error("An error occurred while deleting category:", error);
        toast.error("An error occurred while deleting category.");
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
      setErrorMessage(`An error occurred while ${action} category.`);
      toast.error(`An error occurred while ${action} category.`);
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
