import { Route, Routes } from "react-router-dom";
import { GuestRoute } from "./components/GuestRoute.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { Shell } from "./components/Shell.jsx";
import { useSessionWatch } from "./hooks/useSessionWatch.js";
import { Alerts } from "./pages/Alerts.jsx";
import { Analytics } from "./pages/Analytics.jsx";
import { Landing } from "./pages/Landing.jsx";
import { Login } from "./pages/Login.jsx";
import { Overview } from "./pages/Overview.jsx";
import { Profile } from "./pages/Profile.jsx";
import { PublicNotFound } from "./pages/PublicNotFound.jsx";
import { Settings } from "./pages/Settings.jsx";

export default function App() {
  useSessionWatch();

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route element={<ProtectedRoute />}>
        <Route element={<Shell />}>
          <Route path="overview" element={<Overview />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>
      <Route path="*" element={<PublicNotFound />} />
    </Routes>
  );
}
