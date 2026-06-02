import { useNavigate } from 'react-router-dom'
import { useAdminAccounts } from '../../hooks/useAdmin'
import Skeleton from '../Skeleton'

function SystemAccounts() {
    const navigate = useNavigate()
    const { data: accounts = [], isLoading } = useAdminAccounts()

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

                {/* Accounts List */}
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

            <nav className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 border border-gray-100 rounded-lg flex items-center justify-center"
                >
                    ←
                </button>
                <span className="text-sm font-medium text-gray-900">
                    All Accounts
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                    {accounts.length} total
                </span>
            </nav>

            <div className="p-5 max-w-lg mx-auto flex flex-col gap-3">
                {accounts.length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-8 text-center">
                        <p className="text-sm text-gray-400">No accounts yet</p>
                    </div>
                )}

                {accounts.map(acc => (
                    <div
                        key={acc._id}
                        onClick={() => navigate(`/system/accounts/${acc._id}`)}
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
                                <p className="text-xs text-gray-300 mt-0.5">
                                    {acc.user?.name}
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
                                        Primary
                                    </span>
                                )}
                            </div>
                            <span className="text-gray-300 text-lg">›</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default SystemAccounts