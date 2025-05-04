import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Category from "./pages/Category";
import Profile from "./pages/Profile";
import Map from "./pages/Map";
import Event from "./pages/Event";
import CreateEvent from "./pages/CreateEvent";
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Route layout chính */}
        <Route path="/dashboard/*" element={<Dashboard />}>
          <Route path="category" element={<Category />} />
          <Route path="event" element={<Event />} />
          <Route path="createevent" element={<CreateEvent/>} />
          <Route path="profile" element={<Profile />} />
          <Route path="map" element={<Map />} />
          <Route index element={<div>Welcome to the Dashboard</div>} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
