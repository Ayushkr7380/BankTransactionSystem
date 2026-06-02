import { useQuery } from "@tanstack/react-query"
import { getMeApi } from "../api/auth.api"
import { Navigate } from "react-router-dom"

function SystemProtectedRoute({ children }) {
    const { data , isLoading, isError } = useQuery({
        queryKey: ['me'],
        queryFn: getMeApi,
        retry: false 
    })

    console.log(data)

    if (isLoading){

        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900" />
            </div>
        )
    }
    

    if (isError) return <Navigate to="/login" replace />

    if(!data.data.user.systemUser){
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default SystemProtectedRoute