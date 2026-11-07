
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import AdminPage from "./pages/adminPage";
import RegisterPage from "./pages/registerPage";
import LoginPage from "./pages/loginPage";
import ReceptionistPage from "./pages/receptionistPage";
import DoctorPage from "./pages/doctorPage";

function App() {
  return (
    <>
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/admin/*" element={<AdminPage />} />

        <Route path="/receptionist/*" element={<ReceptionistPage />} />

        <Route path="/doctor/*" element={<DoctorPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;
