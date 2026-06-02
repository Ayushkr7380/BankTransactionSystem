import { Route, Routes, Navigate } from "react-router-dom"
import Login from "../components/authComponents/Login"
import Registration from "../components/authComponents/Registration"
import Home from "../components/Home"
import ChatPage from "../components/ChatPage"
import TransferPage from "../components/TransferPage"
import ProfilePage from '../components/ProfilePage'
import AccountDetailPage from '../components/AccountDetailPage'
import UserProtectedRoute from "../components/UserProtectedRoute"
import SystemProtectedRoute from "../components/SystemProtectedRoute"
import SystemDashboard from "../components/system/SystemDashboard"
import SystemUsers from "../components/system/SystemUsers"
import SystemUserDetail from "../components/system/SystemUserDetail"
import SystemAccounts from "../components/system/SystemAccounts"
import SystemAccountDetail from "../components/system/SystemAccountDetail"
import SystemTransactions from "../components/system/SystemTransactions"
import TransactionsPage from "../components/TransactionsPage"

function CustomRoutes() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
                <UserProtectedRoute>
                    <Home />
                </UserProtectedRoute>
            } />
            <Route path="/transfer" element={
                <UserProtectedRoute>
                    <TransferPage />
                </UserProtectedRoute>
            } />
            <Route path="/chat/:userId" element={
                <UserProtectedRoute>
                    <ChatPage />
                </UserProtectedRoute>
            } />
            <Route path="/profile" element={
                <UserProtectedRoute>
                    <ProfilePage />
                </UserProtectedRoute>
            } />
            <Route path="/account/:accountId" element={
                <UserProtectedRoute>
                    <AccountDetailPage />
                </UserProtectedRoute>
            } />

            <Route path="/system/dashboard" element={
            <SystemProtectedRoute>
                <SystemDashboard />
            </SystemProtectedRoute>
            } />

            <Route path="/system/users" element={
                <SystemProtectedRoute>
                    <SystemUsers />
                </SystemProtectedRoute>
            } />

            <Route path="/system/users/:userId" element={
                <SystemProtectedRoute>
                    <SystemUserDetail />
                </SystemProtectedRoute>
            } />

            <Route path="/system/accounts" element={
                <SystemProtectedRoute>
                    <SystemAccounts />
                </SystemProtectedRoute>
            } />

            <Route path="/system/accounts/:accountId" element={
                <SystemProtectedRoute>
                    <SystemAccountDetail />
                </SystemProtectedRoute>
            } />

            <Route path="/system/transactions" element={
                <SystemProtectedRoute>
                    <SystemTransactions />
                </SystemProtectedRoute>
            } />



            <Route path="/transactions"
                element={
                    <UserProtectedRoute>
                        <TransactionsPage />
                    </UserProtectedRoute>
                }
            />
    
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    )
}

export default CustomRoutes