import { Outlet } from "react-router-dom";
import OrganizerSideBar from "../../components/layout/OrganizerSideBar";

const OrganizerDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar luôn hiển thị */}
      <OrganizerSideBar />

      {/* Outlet là nơi các nội dung con được hiển thị */}
      <main className="flex-1 pl-64">
        <Outlet />
      </main>
    </div>
  );
};

export default OrganizerDashboard;
