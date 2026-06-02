import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogout } from '../hooks/useAuth'
import CreateAccountModal from '../components/CreateAccountModal'
import { useQuery } from '@tanstack/react-query'
import { getMeApi } from '../api/auth.api'
import { useGetMyAccounts } from '../hooks/useAccounts' 
import Skeleton from '../components/Skeleton'

function ProfilePage() {
    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false)

    const { data: userData , isLoading} = useQuery({
        queryKey: ['me'],
        queryFn: getMeApi,
        select: (data) => data.data.user
    })

    const { data: accounts = [], isLoading: accountsLoading } = useGetMyAccounts()

    const { mutate: logout } = useLogout()

    
    const user = userData

    console.log("user :::",user)

    if (isLoading || accountsLoading) {
        return (
            <div className="min-h-screen bg-gray-50">

                {/* Navbar */}
                <div className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-20" />
                </div>

                <div className="p-5 flex flex-col gap-5 max-w-lg mx-auto">

                    {/* Profile Card */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-3">
                        <Skeleton className="w-16 h-16 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-10 w-28 rounded-xl" />
                    </div>  

                    

                    {/* Accounts */}
                    <div>
                        <Skeleton className="h-4 w-28 mb-3" />

                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-20 rounded-xl" />
                            <Skeleton className="h-20 rounded-xl" />
                            <Skeleton className="h-20 rounded-xl" />
                        </div>
                    </div>

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
                <span className="text-sm font-medium text-gray-900">Profile</span>
            </nav>

            <div className="p-5 flex flex-col gap-5 max-w-lg mx-auto">

                {/* Profile Card */}
                <div className="bg-white border border-gray-100 rounded-2xl p-6 flex flex-col items-center gap-2">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-xl font-semibold text-blue-600">
                        {user?.name?.slice(0, 2).toUpperCase() ?? 'U'}
                    </div>

                    <p className="text-base font-medium text-gray-900 mt-1">
                        {user?.name}
                    </p>
                    <p className="text-sm text-gray-400">
                        {user?.email}
                    </p>

                    {/* Logout */}
                    <button
                        onClick={() => logout()}
                        className="mt-3 flex items-center gap-2 text-sm text-red-500 bg-red-50 border border-red-100 px-5 py-2 rounded-xl"
                    >
                        ↑ Logout
                    </button>
                </div>

                {/* Quick Actions */}
                    <div className="bg-white border border-gray-100 rounded-xl p-3">
                        
                        <button
                            onClick={() => navigate('/deposit-requests')}
                            className="w-full flex items-center justify-between px-2 py-2 hover:bg-gray-50 rounded-lg transition"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                                    📄
                                </div>

                                <div className="text-left">
                                    <p className="text-sm font-medium text-gray-900">
                                        Deposit Requests
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        View request history
                                    </p>
                                </div>
                            </div>

                            <span className="text-gray-300 text-lg">›</span>
                        </button>
                    </div>

                {/* Accounts */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            Your Accounts
                        </p>
                        {accounts.length < 3 && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-xs text-blue-600"
                            >
                                + New account
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        {accounts.map(acc => (
                            <div
                                key={acc._id}
                                onClick={() => navigate(`/account/${acc._id}`)}
                                className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-lg">
                                        💰
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {acc.nickname}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {acc.upiId}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-gray-900">
                                            ₹{acc.balance.toLocaleString('en-IN')}
                                        </p>
                                        {acc.isPrimary && (
                                            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                                                ✓ Primary
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-gray-300 text-lg">›</span>
                                </div>
                            </div>
                        ))}

                        {/* Empty slot */}
                        {accounts.length < 3 && (
                            <div
                                onClick={() => setShowModal(true)}
                                className="bg-white border border-dashed border-gray-200 rounded-xl px-4 py-4 text-center cursor-pointer hover:border-gray-300 transition"
                            >
                                <p className="text-sm text-gray-400">
                                    + Add another account
                                </p>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    {3 - accounts.length} more allowed
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showModal && (
                <CreateAccountModal onClose={() => setShowModal(false)} />
            )}
        </div>
    )
}

export default ProfilePage