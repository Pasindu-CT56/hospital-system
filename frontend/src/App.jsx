
import { Route, Routes, Navigate } from "react-router-dom";
import { useState } from "react";

import UserContext from "./context/userContext";
import AdminPage from "./pages/adminPage";

function App() {
  const [user, setUser] = useState(null);
  const [userLoadingFinished, setUserLoadingFinished] = useState(false);

  return (
    <UserContext
      value={{
        user: user,
        setUser: setUser,
        userLoadingFinished: userLoadingFinished,
        setUserLoadingFinished: setUserLoadingFinished,
      }}
    >
      <div className="w-full min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </div>
    </UserContext>
  );
}

export default App;
