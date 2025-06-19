import { Outlet } from "react-router-dom";
import SideBar from "../../components/layout/SideBar";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar luôn hiển thị */}
      <SideBar />

      {/* Outlet là nơi các nội dung con được hiển thị */}
      <main className="flex-1 pl-64">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
