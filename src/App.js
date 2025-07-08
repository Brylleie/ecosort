import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Forum from "./pages/Forum";
import SubmitWaste from "./pages/SubmitWaste";
import Rewards from "./pages/Rewards";
import Report from "./pages/Report";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/submitwaste" element={<SubmitWaste />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/report" element={<Report />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/adminpanel" element={<AdminPanel />} />
      </Routes>
    </Router>
  );
}

export default App;
