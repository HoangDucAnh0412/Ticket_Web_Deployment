import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/admin/Dashboard";
import Category from "./pages/admin/Category";
import Profile from "./pages/Profile";
import Event from "./pages/admin/Event";
import MapTemplate from "./pages/admin/MapTemplate";
import MapDetail from "./components/features/map/MapDetail";
import CreateMapArea from "./components/features/map/CreateMapArea";
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
import CreateArea from "./components/features/event/admin/CreateArea";
import OrganizerCreateArea from "./components/features/event/organizer/OrganizerCreateArea";
import PrivateRoute from "./components/auth/PrivateRoute";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate replace to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected admin routes */}
        <Route
          path="/dashboard/*"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route index element={<div>Welcome to the Dashboard</div>} />
          <Route path="category" element={<Category />} />
          <Route path="event" element={<Event />} />
          <Route path="event/create" element={<CreateEvent />} />
          <Route path="event/edit/:eventId" element={<UpdateEvent />} />
          <Route path="event/:eventId/phase" element={<CreateEventPhase />} />
          <Route path="event/:eventId/area" element={<CreateArea />} />
          <Route path="event/:eventId" element={<EventDetail />} />
          <Route path="map" element={<MapTemplate />} />
          <Route path="map/:id" element={<MapDetail />} />
          <Route path="map/:id/area" element={<CreateMapArea />} />
          <Route path="profile" element={<Profile />} />
          <Route path="user" element={<User />} />
          <Route path="user/edit/:userId" element={<UpdateUser />} />
          <Route path="user/create" element={<CreateUser />} />
          <Route path="user/:userId" element={<UserDetail />} />
        </Route>

        {/* Protected organizer routes */}
        <Route
          path="/organizer/*"
          element={
            <PrivateRoute>
              <OrganizerDashboard />
            </PrivateRoute>
          }
        >
          <Route path="events" element={<OrganizerEvent />} />
          <Route path="events/create" element={<OrganizerCreateEvent />} />
          <Route
            path="events/:eventId/edit"
            element={<OrganizerUpdateEvent />}
          />
          <Route
            path="events/:eventId/phase"
            element={<CreateEventOrganizerPhase />}
          />
          <Route path="events/:eventId" element={<OrganizerEventDetail />} />
          <Route
            path="events/:eventId/area"
            element={<OrganizerCreateArea />}
          />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Catch all route - redirect to login */}
        <Route path="*" element={<Navigate replace to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
