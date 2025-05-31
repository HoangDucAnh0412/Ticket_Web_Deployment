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

const User = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [allUsers, setAllUsers] = useState<User[]>([]); // Store all users for sorting/filtering
  const [pageInput, setPageInput] = useState<string>((currentPage + 1).toString()); // Separate state for pagination input

  // Debounced search handler
  const debouncedSearch = useCallback(
    _.debounce((term: string) => {
      setSearchTerm(term);
      setCurrentPage(0); // Reset to first page on new search
    }, 300),
    []
  );

  // Fetch users for the current page
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Vui lòng đăng nhập để xem danh sách user");
          return;
        }

        const response = await axios.get(
          `http://localhost:8085/api/admin/users?page=${currentPage}&size=${pageSize}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.data) {
          const paginatedData = response.data.data;
          setUsers(paginatedData.content);
          setTotalPages(paginatedData.totalPages);
        } else {
          setError("Không có dữ liệu user");
        }
      } catch (error: any) {
        if (error.response) {
          setError(
            `Lỗi: ${error.response.status} - ${
              error.response.data?.message || "Không thể tải danh sách user"
            }`
          );
        } else {
          setError("Không thể kết nối đến server");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [currentPage, pageSize]);

  // Fetch all users when sorting
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để xem danh sách user");
          return;
        }

        let allFetchedUsers: User[] = [];
        let page = 0;
        let totalPagesFromApi = 0;

        do {
          const response = await axios.get(
            `http://localhost:8085/api/admin/users?page=${page}&size=${pageSize}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.data && response.data.data) {
            const paginatedData = response.data.data;
            allFetchedUsers = [...allFetchedUsers, ...paginatedData.content];
            totalPagesFromApi = paginatedData.totalPages;
          }
          page++;
        } while (page < totalPagesFromApi);

        setAllUsers(allFetchedUsers);
      } catch (error: any) {
        setError(
          `Lỗi khi tải toàn bộ danh sách: ${
            error.response?.data?.message || "Không thể tải dữ liệu"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [sortDirection, pageSize]);

  // Filter and Sort (applied locally without triggering fetch)
  const filteredAndSortedUsers = [...allUsers]
    .filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
    )
    .sort((a, b) =>
      sortDirection === "asc" ? a.userId - b.userId : b.userId - a.userId
    );

  // Paginate the filtered and sorted data
  const paginatedUsers = filteredAndSortedUsers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    setCurrentPage(0); // Reset to first page on sort
  };

  const handleDeleteUser = async (userId: number) => {
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

        await axios.delete(`http://localhost:8085/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers((prev) => prev.filter((user) => user.userId !== userId));
        setAllUsers((prev) => prev.filter((user) => user.userId !== userId)); // Update allUsers as well
        toast.success("Xóa người dùng thành công!");
      } catch (error: any) {
        console.error("Lỗi khi xóa người dùng:", error);
        toast.error("Đã xảy ra lỗi khi xóa người dùng.");
      }
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setPageInput((page + 1).toString()); // Update input value when page changes
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPageInput(value); // Update the input state as the user types
  };

  const handlePageInputBlur = () => {
    const page = parseInt(pageInput) - 1;
    if (!isNaN(page) && page >= 0 && page < totalPages) {
      handlePageChange(page);
    } else {
      setPageInput((currentPage + 1).toString()); // Reset to current page if invalid
    }
  };

  const handlePageInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const page = parseInt(pageInput) - 1;
      if (!isNaN(page) && page >= 0 && page < totalPages) {
        handlePageChange(page);
      } else {
        setPageInput((currentPage + 1).toString()); // Reset to current page if invalid
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
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
          <h3 className="text-xl font-semibold text-black">
            Quản lý người dùng
          </h3>
          <h3 className="text-l text-gray-500 mt-2">
            Danh sách người dùng trong hệ thống
          </h3>
        </div>
        <div className="flex gap-3 flex-col sm:flex-row">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => debouncedSearch(e.target.value)}
            placeholder="Tìm kiếm theo tên hoặc số điện thoại..."
            className="px-4 py-2 border border-gray-300 rounded-md w-64"
          />
          <button
            onClick={handleSort}
            className="px-3 py-2 rounded bg-green-500 text-white"
            title="Sắp xếp theo ID"
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
                <th className="px-6 py-3 border-b min-w-[150px]">Họ và tên</th>
                <th className="px-6 py-3 border-b min-w-[120px]">
                  Số điện thoại
                </th>
                <th className="px-6 py-3 border-b min-w-[120px]">Vai trò</th>
                <th className="px-6 py-3 border-b min-w-[120px]">Trạng thái</th>
                <th className="px-6 py-3 border-b min-w-[150px] text-center">
                  Thao tác
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
                          title="Chỉnh sửa"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDeleteUser(user.userId)}
                          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                          title="Xóa"
                        >
                          <FaTrash />
                        </button>
                        <Link
                          to={`/dashboard/user/${user.userId}`}
                          className="bg-purple-500 text-white px-3 py-2 rounded hover:bg-purple-600"
                          title="Chi tiết"
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
                    Không có người dùng nào.
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

            // Adjust start page if we're near the end
            if (endPage - startPage + 1 < maxVisiblePages) {
              startPage = Math.max(0, endPage - maxVisiblePages + 1);
            }

            // Add first page if not included
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

            // Add visible pages
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

            // Add last page if not included
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

          {/* Page input */}
          <div className="flex items-center gap-2 ml-4">
            <input
              type="text" // Changed to text to allow better control
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
        title="Thêm người dùng"
      >
        <FaPlus />
      </Link>
    </div>
  );
};

export default User;