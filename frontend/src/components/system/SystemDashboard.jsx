import { useNavigate } from 'react-router-dom'
import { useLogout } from '../../hooks/useAuth'
import {
    useAdminStats,
    useAdminPendingRequests,
    useApproveDeposit,
    useRejectDeposit,
} from '../../hooks/useAdmin'
import toast from 'react-hot-toast'

function SystemDashboard() {
    const navigate = useNavigate()
    const { mutate: logout } = useLogout()

    const { data: stats, isLoading: statsLoading } = useAdminStats()
    const { data: notifications = [], isLoading: notiLoading } = useAdminPendingRequests()
    const { mutate: approve, isPending: approving } = useApproveDeposit()
    const { mutate: reject, isPending: rejecting } = useRejectDeposit()

    if (statsLoading || notiLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-5 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l9-3 9 3v6c0 5-4 8-9 9-5-1-9-4-9-9V6z"/>
                        </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                        LedgerPay Admin
                    </span>
                    <span className="text-xs bg-yellow-50 text-yellow-600 border border-yellow-100 px-2 py-0.5 rounded-full">
                        System
                    </span>
                </div>
                <button
                    onClick={() => logout()}
                    className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg"
                >
                    Logout
                </button>
            </nav>

            <div className="p-5 max-w-lg mx-auto flex flex-col gap-5">

                {/* Greeting */}
                <div>
                    <p className="text-lg font-medium text-gray-900">
                        Welcome, Admin
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Full bank access
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2">
                    {[
                        {
                            label: 'Total users',
                            value: stats?.totalUsers ?? 0,
                            icon: '👥',
                            onClick: () => navigate('/system/users')
                        },
                        {
                            label: 'Total accounts',
                            value: stats?.totalAccounts ?? 0,
                            icon: '💳',
                            onClick: () => navigate('/system/accounts')
                        },
                        {
                            label: 'Transactions',
                            value: stats?.totalTransactions ?? 0,
                            icon: '📊',
                            onClick: () => navigate('/system/transactions')
                        },
                        {
                            label: 'System balance',
                            value: `₹${(stats?.systemBalance ?? 0).toLocaleString('en-IN')}`,
                            icon: '💰',
                            onClick: null
                        }
                    ].map(({ label, value, icon, onClick }) => (
                        <div
                            key={label}
                            onClick={onClick}
                            className={`bg-gray-100 rounded-xl p-4 flex flex-col gap-1 ${onClick ? 'cursor-pointer hover:bg-gray-200 transition' : ''}`}
                        >
                            <span className="text-xl">{icon}</span>
                            <p className="text-lg font-medium text-gray-900">
                                {value}
                            </p>
                            <p className="text-xs text-gray-500">{label}</p>
                            {onClick && (
                                <p className="text-xs text-blue-500 mt-0.5">
                                    View all →
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Pending Requests */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-sm font-medium text-gray-900">
                            Pending requests
                        </p>
                        {notifications.length > 0 && (
                            <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full">
                                {notifications.length} pending
                            </span>
                        )}
                    </div>

                    {notifications.length === 0 && (
                        <div className="bg-white border border-gray-100 rounded-xl px-4 py-8 text-center">
                            <p className="text-sm text-gray-400">
                                No pending requests
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {notifications.map(notification => (
                            <div
                                key={notification._id}
                                className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3"
                            >
                                {/* User Info */}
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-semibold text-blue-600">
                                        {notification.fromUser?.name?.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {notification.fromUser?.name}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {notification.fromUser?.email}
                                        </p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="bg-gray-50 rounded-lg px-3 py-2 flex flex-col gap-1.5">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Account</span>
                                        <span className="text-gray-900 font-medium">
                                            {notification.account?.nickname} · {notification.account?.upiId}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Amount</span>
                                        <span className="text-gray-900 font-medium">
                                            ₹{notification.amount?.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-400">Requested</span>
                                        <span className="text-gray-900">
                                            {new Date(notification.createdAt).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => reject(notification._id, {
                                            onSuccess: () => toast.success('Request rejected'),
                                            onError: (err) => toast.error(err.response?.data?.message ?? 'Failed')
                                        })}
                                        disabled={rejecting || approving}
                                        className="flex-1 border border-red-100 text-red-500 bg-red-50 text-sm py-2 rounded-lg disabled:opacity-50"
                                    >
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => approve(notification._id, {
                                            onSuccess: () => toast.success('Deposit approved!'),
                                            onError: (err) => toast.error(err.response?.data?.message ?? 'Failed')
                                        })}
                                        disabled={approving || rejecting}
                                        className="flex-1 bg-gray-900 text-white text-sm py-2 rounded-lg disabled:opacity-50"
                                    >
                                        {approving ? 'Approving...' : 'Approve'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SystemDashboard