import { Link } from "react-router-dom";
import { FaChartBar, FaShoppingCart, FaFileAlt } from "react-icons/fa"; // Import the icons from react-icons
import { IoIosMap } from "react-icons/io";
function SideBar() {
  return (
    <aside className="w-64 bg-grey shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-lg font-bold text-blue-600">Tickvivo</h1>
      </div>

      <nav className="mt-4 px-4 text-sm text-gray-600">
        <p className="text-xs font-semibold mb-2 text-gray-400 uppercase">Menu</p>
        <ul className="space-y-2">
          <li>
            <Link
              to="/dashboard"
              className="flex items-center px-3 py-2 rounded hover:bg-gray-100"
            >
              <FaChartBar className="mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/category"
              className="flex items-center px-3 py-2 rounded hover:bg-gray-100"
            >
              <FaShoppingCart className="mr-2" />
              Category
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/event"
              className="flex items-center px-3 py-2 rounded hover:bg-gray-100"
            >
              <FaChartBar className="mr-2" />
              Event
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/createevent"
              className="flex items-center px-3 py-2 rounded hover:bg-gray-100"
            >
              <FaChartBar className="mr-2" />
               Add Event
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/map"
              className="flex items-center px-3 py-2 rounded hover:bg-gray-100"
            >
              <IoIosMap  className="mr-2" />
              Map
            </Link>
          </li>
          <li>
            <Link
              to="/dashboard/profile"
              className="flex items-center px-3 py-2 rounded hover:bg-gray-100"
            >
              <FaFileAlt className="mr-2" />
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}

export default SideBar;
