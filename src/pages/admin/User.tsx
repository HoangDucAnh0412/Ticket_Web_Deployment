import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FaInfoCircle,
  FaTrash,
  FaEdit,
  FaSortAmountDown,
  FaSortAmountUp,
  FaPlus,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import _ from "lodash"; // For debounce
import { BASE_URL } from "../../utils/const";

interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const ADMIN_USERS_ENDPOINT = (page: number, size: number) =>
  `${BASE_URL}/api/admin/users?page=${page}&size=${size}`;
const ADMIN_USERS_ALL_ENDPOINT = `${BASE_URL}/api/admin/users/all`;
const ADMIN_USER_DELETE_ENDPOINT = (userId: number) =>
  `${BASE_URL}/api/admin/users/${userId}`;

const User = () => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageInput, setPageInput] = useState<string>(
    (currentPage + 1).toString()
  );
  const [showPerformanceWarning, setShowPerformanceWarning] = useState(false);

  // Debounced search handler
  const debouncedSearch = useCallback(
    _.debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(0); // Reset to first page on new search
    }, 300),
    []
  );

  // Fetch all users once on mount
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Please log in to view the user list");
          return;
        }
        // Try to fetch all users from a dedicated endpoint, fallback to paginated fetch if not available
        let allFetchedUsers: User[] = [];
        let response;
        try {
          response = await axios.get(ADMIN_USERS_ALL_ENDPOINT, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.data && response.data.data) {
            allFetchedUsers = response.data.data;
          }
        } catch {
          // Fallback: fetch all pages
          let page = 0;
          let totalPagesFromApi = 0;
          do {
            response = await axios.get(ADMIN_USERS_ENDPOINT(page, 100), {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.data && response.data.data) {
              const paginatedData = response.data.data;
              allFetchedUsers = [...allFetchedUsers, ...paginatedData.content];
              totalPagesFromApi = paginatedData.totalPages;
            }
            page++;
          } while (page < totalPagesFromApi);
        }
        setAllUsers(allFetchedUsers);
        setShowPerformanceWarning(allFetchedUsers.length > 1000);
      } catch (error: any) {
        setError(
          `Error: ${error.response?.status} - ${
            error.response?.data?.message || "Unable to load user list"
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchAllUsers();
  }, []);

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setCurrentPage(0); // Reset to first page on sort
  };

  const handleDeleteUser = async (userId: number) => {
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
          toast.error("Authentication token not found.");
          return;
        }

        await axios.delete(ADMIN_USER_DELETE_ENDPOINT(userId), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setAllUsers((prev) => prev.filter((user) => user.userId !== userId));
        toast.success("User deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting user:", error);
        toast.error("An error occurred while deleting the user.");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPageInput((page + 1).toString());
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInput(e.target.value);
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput) - 1;
    if (!isNaN(page) && page >= 0 && page < totalPages) {
      handlePageChange(page);
    } else {
      setPageInput((currentPage + 1).toString());
    }
  };

  const handlePageInputKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      const page = parseInt(pageInput) - 1;
      if (!isNaN(page) && page >= 0 && page < totalPages) {
        handlePageChange(page);
      } else {
        setPageInput((currentPage + 1).toString());
      }
    }
  };

  const renderRoleWithBackground = (role: string) => {
    let classes = "px-3 py-1 text-sm font-medium rounded-full";
    let displayRole = role;
    switch (role.toLowerCase()) {
      case "admin":
        classes += " text-red-700 bg-red-100 border border-red-300";
        displayRole = "Admin";
        break;
      case "organizer":
        classes += " text-purple-700 bg-purple-100 border border-purple-300";
        displayRole = "Organizer";
        break;
      case "user":
        classes += " text-blue-700 bg-blue-100 border border-blue-300";
        displayRole = "User";
        break;
      default:
        classes += " text-gray-700 bg-gray-100 border border-gray-300";
        displayRole = role.charAt(0).toUpperCase() + role.slice(1);
    }
    return <span className={classes}>{displayRole}</span>;
  };

  const renderStatusWithBackground = (active: boolean) => {
    let classes = "px-3 py-1 text-sm font-medium rounded-full";
    let displayStatus = active ? "Active" : "Inactive";
    if (active) {
      classes += " text-green-700 bg-green-100 border border-green-300";
    } else {
      classes += " text-red-700 bg-red-100 border border-red-300";
    }
    return <span className={classes}>{displayStatus}</span>;
  };

  // Filter and Sort (applied locally)
  const filteredAndSortedUsers = [...allUsers]
    .filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) =>
      sortDirection === "asc" ? a.userId - b.userId : b.userId - a.userId
    );

  // Paginate the filtered and sorted data
  const paginatedUsers = filteredAndSortedUsers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredAndSortedUsers.length / pageSize));
    if (
      currentPage > 0 &&
      currentPage >= Math.ceil(filteredAndSortedUsers.length / pageSize)
    ) {
      setCurrentPage(0);
      setPageInput("1");
    }
  }, [filteredAndSortedUsers.length, pageSize]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white min-h-screen relative">
      <ToastContainer />
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <div>
          <h3 className="text-xl font-semibold text-black">User Management</h3>
          <h3 className="text-l text-gray-500 mt-2">
            List of users in the system
          </h3>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              debouncedSearch(e.target.value);
            }}
            placeholder="Search by name, phone, email, or username..."
            className="px-4 py-2 border border-gray-300 rounded-md w-64"
          />
          <button
            onClick={handleSort}
            className="px-3 py-2 rounded bg-green-500 text-white"
            title="Sort by ID"
          >
            {sortDirection === "asc" ? (
              <FaSortAmountUp />
            ) : (
              <FaSortAmountDown />
            )}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto shadow rounded-lg border border-gray-500 bg-white mt-5">
        <div className="min-w-[800px]">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="bg-gray-300 text-gray-700 text-sm uppercase">
              <tr>
                <th className="px-6 py-3 border-b min-w-[80px]">ID</th>
                <th className="px-6 py-3 border-b min-w-[150px]">Email</th>
                <th className="px-6 py-3 border-b min-w-[150px]">Full Name</th>
                <th className="px-6 py-3 border-b min-w-[120px]">
                  Phone Number
                </th>
                <th className="px-6 py-3 border-b min-w-[120px]">Role</th>
                <th className="px-6 py-3 border-b min-w-[120px]">Status</th>
                <th className="px-6 py-3 border-b min-w-[150px] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b">{user.userId}</td>
                    <td className="px-6 py-4 border-b">{user.email}</td>
                    <td className="px-6 py-4 border-b">{user.fullName}</td>
                    <td className="px-6 py-4 border-b">{user.phone}</td>
                    <td className="px-6 py-4 border-b">
                      {renderRoleWithBackground(user.role)}
                    </td>
                    <td className="px-6 py-4 border-b">
                      {renderStatusWithBackground(user.active)}
                    </td>
                    <td className="px-6 py-4 border-b text-center">
                      <div className="flex justify-center space-x-2">
                        <Link
                          to={`/dashboard/user/edit/${user.userId}`}
                          className="bg-sky-500 text-white px-3 py-2 rounded hover:bg-sky-600"
                          title="Edit"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user.userId)}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                        <Link
                          to={`/dashboard/user/${user.userId}`}
                          className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
                          title="Details"
                        >
                          <FaInfoCircle />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>

          {/* Calculate which pages to show */}
          {(() => {
            const pages = [];
            const maxVisiblePages = 4;
            let startPage = Math.max(
              0,
              currentPage - Math.floor(maxVisiblePages / 2)
            );
            let endPage = Math.min(
              totalPages - 1,
              startPage + maxVisiblePages - 1
            );

            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(0, endPage - maxVisiblePages + 1);
            }

            if (startPage > 0) {
              pages.push(
                <button
                  key={0}
                  onClick={() => handlePageChange(0)}
                  className="px-4 py-2 rounded bg-gray-300"
                >
                  1
                </button>
              );
              if (startPage > 1) {
                pages.push(
                  <span key="start-ellipsis" className="px-2">
                    ...
                  </span>
                );
              }
            }

            for (let i = startPage; i <= endPage; i++) {
              pages.push(
                <button
                  key={i}
                  onClick={() => handlePageChange(i)}
                  className={`px-4 py-2 rounded ${
                    currentPage === i ? "bg-blue-500 text-white" : "bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              );
            }

            if (endPage < totalPages - 1) {
              if (endPage < totalPages - 2) {
                pages.push(
                  <span key="end-ellipsis" className="px-2">
                    ...
                  </span>
                );
              }
              pages.push(
                <button
                  key={totalPages - 1}
                  onClick={() => handlePageChange(totalPages - 1)}
                  className="px-4 py-2 rounded bg-gray-300"
                >
                  {totalPages}
                </button>
              );
            }

            return pages;
          })()}

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>

          <div className="flex items-center gap-2 ml-4">
            <input
              type="text"
              value={pageInput}
              onChange={handlePageInputChange}
              onBlur={handlePageInputBlur}
              onKeyPress={handlePageInputKeyPress}
              className="w-16 px-2 py-2 border border-gray-300 rounded text-center"
            />
            <span className="text-gray-600">/ {totalPages}</span>
          </div>
        </div>
      )}

      <Link
        to="/dashboard/user/create"
        className="fixed bottom-6 right-6 bg-yellow-500 text-white p-4 rounded-full shadow-lg hover:bg-yellow-600 transition-transform hover:scale-110"
        title="Add user"
      >
        <FaPlus />
      </Link>

    </div>
  );
};

export default User;
