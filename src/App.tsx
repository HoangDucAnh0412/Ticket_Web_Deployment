import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useParams,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Category from "./pages/admin/Category";
import Profile from "./pages/Profile";
import Event from "./pages/admin/Event";
import MapTemplate from "./pages/admin/MapTemplate";
import EventDetail from "./components/features/event/admin/EventDetail";
import CreateEvent from "./components/features/event/admin/CreateEvent";
import CreateEventPhase from "./components/features/event/admin/CreateEventPhase";
import User from "./pages/admin/User";
import UpdateUser from "./components/features/user/UpdateUser";
import CreateUser from "./components/features/user/CreateUser";
import UserDetail from "./components/features/user/UserDetail";
import UpdateEvent from "./components/features/event/admin/UpdateEvent";
import OrganizerDashboard from "./pages/organizer/OrganizerDashboard";
import OrganizerEvent from "./pages/organizer/OrganizerEvent";
import OrganizerEventDetail from "./components/features/event/organizer/OrganizerEventDetail";
import OrganizerCreateEvent from "./components/features/event/organizer/OrganizerCreateEvent";
import CreateEventOrganizerPhase from "./components/features/event/organizer/OrganizerCreateEventPhase";
import OrganizerUpdateEvent from "./components/features/event/organizer/OrganizerUpdateEvent";
import Register from "./pages/Register";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Khi vào / thì redirect về /login */}
        <Route path="/" element={<Navigate replace to="/login" />} />

        {/* Trang Login */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Route layout chính */}
        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route index element={<div>Welcome to the Dashboard</div>} />
          <Route path="category" element={<Category />} />
          <Route path="event" element={<Event />} />
          <Route path="event/create" element={<CreateEvent />} />
          <Route path="event/edit/:eventId" element={<UpdateEvent />} />
          <Route path="event/:eventId/phase" element={<CreateEventPhase />} />
          <Route path="event/:eventId" element={<EventDetail />} />
          <Route path="map" element={<MapTemplate />} />
          <Route path="profile" element={<Profile />} />
          <Route path="user" element={<User />} />
          <Route path="user/edit/:userId" element={<UpdateUser />} />
          <Route path="user/create" element={<CreateUser />} />
          <Route path="user/:userId" element={<UserDetail />} />
        </Route>

        {/* Route layout cho organizer */}
        <Route path="/organizer/*" element={<OrganizerDashboard />}>
          <Route path="events" element={<OrganizerEvent />} />
          <Route path="events/create" element={<OrganizerCreateEvent />} />
          <Route path="events/:eventId/edit" element={<OrganizerUpdateEvent />} />
          <Route path="events/:eventId/phase" element={<CreateEventOrganizerPhase />}/>
          <Route path="events/:eventId" element={<OrganizerEventDetail />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Optional: với mọi đường dẫn không khớp, cũng redirect về login
        <Route path="*" element={<Navigate replace to="/login" />} /> */}
      </Routes>
    </Router>
  );
};

export default App;
