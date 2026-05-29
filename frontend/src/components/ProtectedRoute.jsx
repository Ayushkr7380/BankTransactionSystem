// components/ProtectedRoute.jsx
import { useQuery } from "@tanstack/react-query"
import { getMeApi } from "../api/auth.api"
import { Navigate } from "react-router-dom"

function ProtectedRoute({ children }) {
    const { isLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: getMeApi,
        retry: false 
    })

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
        </div>
    )

    if (isError) return <Navigate to="/login" replace />

    return children
}

export default ProtectedRoute