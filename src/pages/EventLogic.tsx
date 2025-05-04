// import { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import Swal from "sweetalert2";

// export interface Event {
//   eventId: number;
//   categoryId: number;
//   organizerId: number;
//   mapTemplateId: number;
//   name: string;
//   description: string;
//   date: string;
//   time: string;
//   location: string;
//   imageUrl: string;
//   bannerUrl: string;
//   status: string;
// }

// export const useEventLogic = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editEventId, setEditEventId] = useState<number | null>(null);
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [date, setDate] = useState("");
//   const [time, setTime] = useState("");
//   const [location, setLocation] = useState("");
//   const [status, setStatus] = useState("approved");
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [bannerFile, setBannerFile] = useState<File | null>(null);
//   const [events, setEvents] = useState<Event[]>([]);
//   const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [searchTerm, setSearchTerm] = useState("");

//   const fetchEvents = async () => {
//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Không tìm thấy token xác thực.");
//         return;
//       }

//       const response = await axios.get<Event[]>(
//         "http://localhost:8085/api/admin/events",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       setEvents(response.data);
//       setFilteredEvents(response.data);
//     } catch (error: any) {
//       console.error("Lỗi khi lấy danh sách sự kiện:", error);
//       toast.error("Đã xảy ra lỗi khi lấy danh sách sự kiện.");
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const handleEditEvent = (event: Event) => {
//     setIsEditMode(true);
//     setEditEventId(event.eventId);
//     setName(event.name);
//     setDescription(event.description);
//     setDate(event.date);
//     setTime(event.time);
//     setLocation(event.location);
//     setStatus(event.status);
//     setShowModal(true);
//   };

//   const handleUpdateEvent = async () => {
//     if (editEventId === null) return;

//     try {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         toast.error("Không tìm thấy token xác thực.");
//         return;
//       }

//       const formData = new FormData();
//       formData.append(
//         "event",
//         JSON.stringify({
//           name,
//           description,
//           date,
//           time,
//           location,
//           status,
//           removeImage: true,
//           removeBanner: true,
//         })
//       );

//       if (imageFile) {
//         formData.append("image", imageFile);
//       }

//       if (bannerFile) {
//         formData.append("banner", bannerFile);
//       }

//       const response = await axios.put(
//         `http://localhost:8085/api/admin/events/${editEventId}`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );

//       const updated = events.map((event) =>
//         event.eventId === editEventId ? response.data : event
//       );
//       setEvents(updated);
//       setFilteredEvents(updated);
//       setShowModal(false);
//       resetForm();
//       toast.success("Cập nhật sự kiện thành công!");
//     } catch (error: any) {
//       if (error.response && error.response.status === 400) {
//         setErrorMessage(error.response.data.message);
//         toast.error(error.response.data.message);
//       } else {
//         setErrorMessage("Đã xảy ra lỗi khi cập nhật sự kiện.");
//         toast.error("Đã xảy ra lỗi khi cập nhật sự kiện.");
//       }
//     }
//   };

//   const resetForm = () => {
//     setName("");
//     setDescription("");
//     setDate("");
//     setTime("");
//     setLocation("");
//     setStatus("approved");
//     setImageFile(null);
//     setBannerFile(null);
//     setIsEditMode(false);
//     setEditEventId(null);
//     setErrorMessage("");
//   };

//   return {
//     showModal,
//     setShowModal,
//     isEditMode,
//     name,
//     setName,
//     description,
//     setDescription,
//     date,
//     setDate,
//     time,
//     setTime,
//     location,
//     setLocation,
//     status,
//     setStatus,
//     imageFile,
//     setImageFile,
//     bannerFile,
//     setBannerFile,
//     events,
//     filteredEvents,
//     searchTerm,
//     setSearchTerm,
//     errorMessage,
//     handleEditEvent,
//     handleUpdateEvent,
//     resetForm,
//   };
// };