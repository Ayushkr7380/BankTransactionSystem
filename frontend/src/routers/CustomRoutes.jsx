import { Route, Routes, Navigate } from "react-router-dom"
import Login from "../components/authComponents/Login"
import Registration from "../components/authComponents/Registration"
import Home from "../components/Home"
import ChatPage from "../components/ChatPage"
import TransferPage from "../components/TransferPage"
import ProtectedRoute from "../components/ProtectedRoute"

function CustomRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Home />
                </ProtectedRoute>
            } />
            <Route path="/transfer" element={
                <ProtectedRoute>
                    <TransferPage />
                </ProtectedRoute>
            } />
            <Route path="/chat/:userId" element={
                <ProtectedRoute>
                    <ChatPage />
                </ProtectedRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default CustomRoutes