import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch, FaSync, FaEye, FaFilter, FaCalendarAlt, FaMoneyBillWave, FaTicketAlt, FaQrcode, FaUser, FaTimes, FaMapMarkerAlt } from "react-icons/fa";
import React from "react";
import _ from "lodash";
import { BASE_URL } from "../../utils/const";

interface TicketResponse {
    ticketCode: string;
    status: string;
    purchaseDate: string;
    price: number;
    transactionId: string;
    eventName: string;
    areaName: string;
    phaseStartTime: string;
    phaseEndTime: string;
    userFullName: string;
    userEmail: string;
    ticketId: number | null;
    eventId: number | null;
    areaId: number | null;
    phaseId: number | null;
    userId: number | null;
    eventDate: string;
    eventTime: string;
    eventLocation: string;
    paymentMethod: string;
}

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

interface Event {
    eventId: number;
    categoryId: number;
    organizerId: number;
    mapTemplateId: number;
    name: string;
    description: string;
    date: string;
    time: string;
    location: string;
    imageUrl: string;
    bannerUrl: string;
    status: string;
}

const TICKETS_ENDPOINT = `${BASE_URL}/api/organizer/tickets`;
const EVENTS_ENDPOINT = `${BASE_URL}/api/organizer/events`;

const OrganizerTicket = () => {
    const [tickets, setTickets] = useState<TicketResponse[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [eventsLoading, setEventsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedEventId, setSelectedEventId] = useState<string>("");
    const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Advanced filters
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [dateFilter, setDateFilter] = useState("");

    // Debounced search handler
    const debouncedSearch = useCallback(
        _.debounce((term: string) => {
            setSearchTerm(term);
            setCurrentPage(1);
        }, 300),
        []
    );

    const fetchEvents = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("No authentication token found.");
                return;
            }

            setEventsLoading(true);
            const response = await axios.get<Event[]>(
                `${EVENTS_ENDPOINT}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            // API returns array directly, not wrapped in status/data
            console.log("Events response:", response.data);
            if (Array.isArray(response.data)) {
                setEvents(response.data);
                console.log("Events set successfully:", response.data);
                // Auto-select first event if none selected
                if (response.data.length > 0) {
                    setSelectedEventId(response.data[0].eventId.toString());
                    console.log("Auto-selected event ID:", response.data[0].eventId);
                }
            } else {
                console.error("Unexpected response format:", response.data);
                toast.error("Failed to fetch events - unexpected response format");
            }
        } catch (error: any) {
            console.error("Error fetching events:", error);
            toast.error("An error occurred while fetching events.");
        } finally {
            setEventsLoading(false);
        }
    };

    const fetchTickets = async (page: number = 1) => {
        if (!selectedEventId) return;

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("No authentication token found.");
                return;
            }

            setLoading(true);
            const params = new URLSearchParams({
                eventId: selectedEventId,
                page: (page - 1).toString(),
                size: pageSize.toString()
            });

            if (statusFilter !== "all") {
                params.append("status", statusFilter);
            }

            const response = await axios.get<ApiResponse<TicketResponse[]>>(
                `${TICKETS_ENDPOINT}?${params.toString()}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.data.status === "success") {
                setTickets(response.data.data);
            } else {
                toast.error(response.data.message || "Failed to fetch tickets");
            }
        } catch (error: any) {
            console.error("Error fetching tickets:", error);
            setError("An error occurred while fetching tickets.");
            toast.error("An error occurred while fetching tickets.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchTickets(currentPage);
        }
    }, [currentPage, statusFilter, selectedEventId]);

    const handleSearch = (term: string) => {
        debouncedSearch(term);
    };

    const handleRefresh = () => {
        fetchTickets(currentPage);
    };

    const handleViewDetail = (ticket: TicketResponse) => {
        setSelectedTicket(ticket);
        setShowDetailModal(true);
    };

    const handleEventChange = (eventId: string) => {
        setSelectedEventId(eventId);
        setCurrentPage(1);
    };

    const filteredTickets = tickets.filter((ticket) => {
        const matchesSearch =
            ticket.userFullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.areaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.transactionId.toLowerCase().includes(searchTerm.toLowerCase());

        const ticketDate = new Date(ticket.purchaseDate);
        const matchesDate = !dateFilter || ticketDate >= new Date(dateFilter);

        return matchesSearch && matchesDate;
    });

    const clearAllFilters = () => {
        setSearchTerm("");
        setStatusFilter("all");
        setDateFilter("");
        setCurrentPage(1);
    };

    const renderStatusBadge = (status: string) => {
        let classes = "px-3 py-1 text-sm font-medium rounded-full";
        let displayStatus = status;

        switch (status?.toLowerCase()) {
            case "sold":
                classes += " text-green-700 bg-green-100 border border-green-300";
                displayStatus = "Sold";
                break;
            case "used":
                classes += " text-blue-700 bg-blue-100 border border-blue-300";
                displayStatus = "Used";
                break;
            case "cancelled":
                classes += " text-red-700 bg-red-100 border border-red-300";
                displayStatus = "Cancelled";
                break;
            default:
                classes += " text-gray-700 bg-gray-100 border border-gray-300";
                displayStatus = status?.charAt(0).toUpperCase() + status?.slice(1);
        }
        return <span className={classes}>{displayStatus}</span>;
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const DetailModal = () => {
        if (!selectedTicket) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="bg-green-100 p-2 rounded-lg">
                                    <FaTicketAlt className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
                                    <p className="text-gray-500 text-sm">Transaction ID: {selectedTicket.transactionId}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Status and Price Header */}
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <FaMoneyBillWave className="text-green-600" size={24} />
                                        <span className="text-3xl font-bold text-gray-900">{formatAmount(selectedTicket.price)}</span>
                                    </div>
                                    <p className="text-gray-600">Ticket Price</p>
                                </div>
                                <div className="text-right">
                                    <div className="mb-2">{renderStatusBadge(selectedTicket.status)}</div>
                                    <p className="text-gray-600 text-sm">Status</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6 mb-6">
                            {/* Customer Info */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <FaUser className="text-blue-600" size={16} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900">Customer Info</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600 text-sm">Full Name</p>
                                        <p className="font-medium">{selectedTicket.userFullName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Email</p>
                                        <p className="font-medium text-blue-600">{selectedTicket.userEmail}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Event Info */}
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-purple-100 p-2 rounded-lg">
                                        <FaCalendarAlt className="text-purple-600" size={16} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900">Event Info</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600 text-sm">Event Name</p>
                                        <p className="font-medium">{selectedTicket.eventName}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Date & Time</p>
                                        <p className="font-medium">{selectedTicket.eventDate} at {selectedTicket.eventTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Location</p>
                                        <p className="font-medium flex items-center gap-1">
                                            <FaMapMarkerAlt size={12} />
                                            {selectedTicket.eventLocation}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Area</p>
                                        <p className="font-medium">{selectedTicket.areaName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Transaction & Phase Info */}
                        <div className="grid lg:grid-cols-2 gap-6 mb-6">
                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-orange-100 p-2 rounded-lg">
                                        <FaMoneyBillWave className="text-orange-600" size={16} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900">Transaction Info</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600 text-sm">Transaction ID</p>
                                        <p className="font-medium font-mono text-xs">{selectedTicket.transactionId}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Payment Method</p>
                                        <p className="font-medium capitalize">{selectedTicket.paymentMethod}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Purchase Date</p>
                                        <p className="font-medium">{formatDate(selectedTicket.purchaseDate)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="bg-indigo-100 p-2 rounded-lg">
                                        <FaCalendarAlt className="text-indigo-600" size={16} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-gray-900">Selling Phase</h3>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-gray-600 text-sm">Phase Start</p>
                                        <p className="font-medium">{formatDate(selectedTicket.phaseStartTime)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-sm">Phase End</p>
                                        <p className="font-medium">{formatDate(selectedTicket.phaseEndTime)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-gray-100 p-2 rounded-lg">
                                    <FaQrcode className="text-gray-600" size={16} />
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900">QR Code</h3>
                            </div>
                            <div className="text-center">
                                <img
                                    src={selectedTicket.ticketCode}
                                    alt={`QR Code for Ticket`}
                                    className="w-48 h-48 mx-auto mb-4 rounded border shadow-sm"
                                    onError={(e) => {
                                        e.currentTarget.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik05NiAxNDRDMTIwIDEyMCAxNDQgMTIwIDE0NCA5NkMxNDQgNzIgMTIwIDQ4IDk2IDQ4QzcyIDQ4IDQ4IDcyIDQ4IDk2QzQ4IDEyMCA3MiAxNDQgOTYgMTQ0WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K";
                                    }}
                                />
                                <button
                                    onClick={() => window.open(selectedTicket.ticketCode, '_blank')}
                                    className="text-green-600 hover:text-green-800 flex items-center gap-2 mx-auto bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
                                >
                                    <FaEye size={14} />
                                    View Full Size
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Calculate analytics
    const analytics = {
        totalTickets: tickets.length,
        soldTickets: tickets.filter(t => t.status === "sold").length,
        usedTickets: tickets.filter(t => t.status === "used").length,
        totalRevenue: tickets.reduce((sum, t) => sum + (t.status === "sold" || t.status === "used" ? t.price : 0), 0),
    };

    const currentEvent = events.find(e => e.eventId.toString() === selectedEventId);

    // Debug logging
    console.log("Events state:", events);
    console.log("Events loading:", eventsLoading);
    console.log("Selected event ID:", selectedEventId);

    if (eventsLoading) {
        return (
            <div className="p-6 bg-white min-h-screen">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="p-6 bg-gray-50 min-h-screen">
                <div className="text-center py-12">
                    <FaTicketAlt className="text-gray-400 text-6xl mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Events Found</h2>
                    <p className="text-gray-600">You don't have any events yet. Create an event to manage its tickets.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ToastContainer />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                        <FaTicketAlt className="text-green-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Event Tickets</h1>
                        <p className="text-gray-600">Monitor and manage tickets for your events</p>
                    </div>
                </div>

                {/* Event Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-green-600" />
                            <span className="font-medium text-gray-700">Select Event:</span>
                        </div>
                        <select
                            value={selectedEventId}
                            onChange={(e) => handleEventChange(e.target.value)}
                            className="flex-1 max-w-md p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                            <option value="">Select an event</option>
                            {events.map((event) => (
                                <option key={event.eventId} value={event.eventId.toString()}>
                                    {event.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {!selectedEventId ? (
                <div className="text-center py-12">
                    <FaTicketAlt className="text-gray-400 text-6xl mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Select an Event</h2>
                    <p className="text-gray-500">Choose an event from the dropdown above to view its tickets.</p>
                </div>
            ) : (
                <>
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Total Tickets</p>
                                    <p className="text-2xl font-bold">{analytics.totalTickets}</p>
                                </div>
                                <div className="bg-green-400 bg-opacity-30 p-3 rounded-lg">
                                    <FaTicketAlt size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Sold Tickets</p>
                                    <p className="text-2xl font-bold">{analytics.soldTickets}</p>
                                </div>
                                <div className="bg-blue-400 bg-opacity-30 p-3 rounded-lg">
                                    <FaMoneyBillWave size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Used Tickets</p>
                                    <p className="text-2xl font-bold">{analytics.usedTickets}</p>
                                </div>
                                <div className="bg-purple-400 bg-opacity-30 p-3 rounded-lg">
                                    <FaQrcode size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-orange-100 text-sm font-medium">Total Revenue</p>
                                    <p className="text-2xl font-bold">{formatAmount(analytics.totalRevenue)}</p>
                                </div>
                                <div className="bg-orange-400 bg-opacity-30 p-3 rounded-lg">
                                    <FaMoneyBillWave size={24} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                            {/* Search */}
                            <div className="flex-1 max-w-md">
                                <div className="relative">
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by customer, area, or transaction ID..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        value={searchTerm}
                                        onChange={(e) => handleSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Status Filter and Actions */}
                            <div className="flex items-center gap-3">
                                <div className="flex gap-2">
                                    {["all", "sold", "used", "cancelled"].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                                ? "bg-green-500 text-white shadow-md"
                                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="border-l border-gray-300 pl-3 flex gap-2">
                                    <button
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className={`p-3 rounded-lg transition-colors flex items-center gap-2 ${showAdvancedFilters
                                            ? "bg-green-500 text-white"
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                            }`}
                                        title="Advanced Filters"
                                    >
                                        <FaFilter className="w-4 h-4" />
                                        <span className="text-sm font-medium">Filters</span>
                                    </button>
                                    <button
                                        onClick={handleRefresh}
                                        className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Refresh"
                                    >
                                        <FaSync className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        {showAdvancedFilters && (
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <FaFilter className="text-green-500" />
                                        Advanced Filters
                                    </h3>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1"
                                    >
                                        <FaTimes size={12} />
                                        Clear All
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Date Filter */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date From</label>
                                        <input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                {/* Active Filters Display */}
                                {dateFilter && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="font-medium">Active filters:</span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                Date: {dateFilter}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm text-left text-gray-700">
                            <thead className="bg-gray-100 text-gray-700 text-sm uppercase">
                                <tr>
                                    <th className="px-6 py-3 border-b">Customer</th>
                                    <th className="px-6 py-3 border-b">Area</th>
                                    <th className="px-6 py-3 border-b">Price</th>
                                    <th className="px-6 py-3 border-b">Status</th>
                                    <th className="px-6 py-3 border-b">Purchase Date</th>
                                    <th className="px-6 py-3 border-b">Transaction ID</th>
                                    <th className="px-6 py-3 border-b text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 border-b">
                                                <div>
                                                    <div className="font-medium">{ticket.userFullName}</div>
                                                    <div className="text-gray-500 text-xs">{ticket.userEmail}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b font-medium">
                                                {ticket.areaName}
                                            </td>
                                            <td className="px-6 py-4 border-b font-medium">
                                                {formatAmount(ticket.price)}
                                            </td>
                                            <td className="px-6 py-4 border-b">
                                                {renderStatusBadge(ticket.status)}
                                            </td>
                                            <td className="px-6 py-4 border-b text-sm">
                                                {formatDate(ticket.purchaseDate)}
                                            </td>
                                            <td className="px-6 py-4 border-b">
                                                <div className="font-mono text-xs">
                                                    {ticket.transactionId.substring(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 border-b text-center">
                                                <button
                                                    onClick={() => handleViewDetail(ticket)}
                                                    className="bg-green-500 text-white px-3 py-2 rounded hover:bg-green-600"
                                                    title="View Details"
                                                >
                                                    <FaEye />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            {searchTerm || statusFilter !== "all"
                                                ? "No tickets found matching your criteria"
                                                : "No tickets found for this event"
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {/* Ticket Detail Modal */}
            {showDetailModal && <DetailModal />}
        </div>
    );
};

export default OrganizerTicket;
