import { useNavigate } from 'react-router-dom'
import { useAdminUsers } from '../../hooks/useAdmin'
import Skeleton from '../Skeleton'

function SystemUsers() {
    const navigate = useNavigate()
    const { data: users = [], isLoading } = useAdminUsers()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">

                {/* Navbar */}
                <div className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-24" />
                    <div className="ml-auto">
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>

                {/* Users List */}
                <div className="p-5 max-w-lg mx-auto flex flex-col gap-3">

                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />
                    <Skeleton className="h-20 rounded-xl" />

                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 border border-gray-100 rounded-lg flex items-center justify-center"
                >
                    ←
                </button>
                <span className="text-sm font-medium text-gray-900">
                    All Users
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                    {users.length} total
                </span>
            </nav>

            <div className="p-5 max-w-lg mx-auto flex flex-col gap-3">
                {users.length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-8 text-center">
                        <p className="text-sm text-gray-400">No users yet</p>
                    </div>
                )}

                {users.map(user => (
                    <div
                        key={user._id}
                        onClick={() => navigate(`/system/users/${user._id}`)}
                        className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-600">
                                {user.name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="text-right">
                                <p className="text-xs text-gray-400">
                                    {user.accountCount} accounts
                                </p>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    {new Date(user.createdAt).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                            <span className="text-gray-300 text-lg">›</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SystemUsers