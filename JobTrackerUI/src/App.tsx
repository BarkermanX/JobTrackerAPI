import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./login";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "./AuthContext";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;