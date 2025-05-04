import { Outlet } from "react-router-dom";
import SideBar from "../components/SideBar";

const Dashboard = () => {
  return (
    <div className="flex min-h-screen bg-white-50">
      {/* Sidebar luôn hiển thị */}
      <SideBar />

      {/* Outlet là nơi các nội dung con được hiển thị */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
