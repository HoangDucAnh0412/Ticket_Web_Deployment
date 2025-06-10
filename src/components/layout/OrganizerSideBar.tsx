import { useLocation } from "react-router-dom";
import { FaUser, FaThList, FaTicketAlt, FaExchangeAlt, FaQrcode } from "react-icons/fa";
import { Link } from "react-router-dom";

function OrganizerSideBar() {
  const location = useLocation();
  const menuItems = [
    { to: "/organizer/events", icon: <FaThList />, label: "Event" },
    { to: "/organizer/transactions", icon: <FaExchangeAlt />, label: "Transactions" },
    { to: "/organizer/tickets", icon: <FaQrcode />, label: "Tickets" },
  ];

  return (
    <aside className="bg-green-0 shadow-md fixed top-0 left-0 h-full flex flex-col w-54 z-20">
      <div className="flex items-center gap-3 py-6 px-6 border-b border-gray-200">
        <div className="bg-green-100 text-green-500 rounded-full p-2">
          <FaTicketAlt size={24} />
        </div>
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
          <span className="font-bold text-black text-lg">Tick</span>
          <span className="font-bold text-green-500 text-lg">vi</span>
          <span className="font-bold text-black text-lg">vo</span>
          </div>
          <span className="text-gray-500 text-sm">Organizer</span>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 text-sm text-gray-600">
        <p className="text-xs font-semibold mb-2 text-gray-400 uppercase tracking-wider px-4">
          Menu
        </p>
        <ul className="space-y-1 mb-6">
          {menuItems.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${location.pathname === item.to
                    ? "bg-green-100 text-green-500 font-medium"
                    : "hover:bg-green-100 hover:text-green-500"
                }`}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs font-semibold mb-2 text-gray-400 uppercase tracking-wider px-4">
          Others
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              to="/organizer/profile"
              className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${location.pathname === "/organizer/profile"
                  ? "bg-green-100 text-green-500 font-medium"
                  : "hover:bg-green-100 hover:text-green-500"
              }`}
            >
              <span className="mr-3 text-lg">
                <FaUser />
              </span>
              Account
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default OrganizerSideBar;