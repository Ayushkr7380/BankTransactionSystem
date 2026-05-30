import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import API from '../api/axios'
import toast from 'react-hot-toast'
import { useLogout } from '../hooks/useAuth'

function SystemDashboard() {
    const queryClient = useQueryClient()
    const { mutate: logout } = useLogout()

    const { data, isLoading } = useQuery({
        queryKey: ['pending-requests'],
        queryFn: () => API.get('/notifications/pending'),
        select: (res) => res.data.notifications
    })

    const { mutate: approve, isPending: approving } = useMutation({
        mutationFn: (notificationId) =>
            API.post(`/notifications/approve/${notificationId}`),

        onSuccess: () => {
            toast.success('Deposit approved!')
            queryClient.invalidateQueries(['pending-requests'])
        },

        onError: (error) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    })

    const { mutate: reject, isPending: rejecting } = useMutation({
        mutationFn: (notificationId) =>
            API.post(`/notifications/reject/${notificationId}`),

        onSuccess: () => {
            toast.success('Request rejected')
            queryClient.invalidateQueries(['pending-requests'])
        },

        onError: (error) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    })

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
        </div>
    )

    const notifications = data ?? []

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l9-3 9 3v6c0 5-4 8-9 9-5-1-9-4-9-9V6z"/>
                        </svg>
                    </div>
                    <span className="text-sm font-medium">System Dashboard</span>
                </div>
                <button
                    onClick={() => logout()}
                    className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-lg"
                >
                    Logout
                </button>
            </nav>

            <div className="p-5 max-w-lg mx-auto flex flex-col gap-4">

                {/* Header */}
                <div>
                    <p className="text-lg font-medium text-gray-900">
                        Pending Requests
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {notifications.length} requests pending
                    </p>
                </div>

                {/* Empty State */}
                {notifications.length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-10 text-center">
                        <p className="text-sm text-gray-400">
                            No pending requests
                        </p>
                    </div>
                )}

                {/* Requests List */}
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

                        {/* Request Details */}
                        <div className="bg-gray-50 rounded-lg px-3 py-2 flex flex-col gap-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400">Account</span>
                                <span className="text-gray-900 font-medium">
                                    {notification.account?.nickname} — {notification.account?.upiId}
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

                        {/* Approve / Reject Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => reject(notification._id)}
                                disabled={rejecting || approving}
                                className="flex-1 border border-red-100 text-red-500 text-sm py-2 rounded-lg disabled:opacity-50"
                            >
                                Reject
                            </button>
                            <button
                                onClick={() => approve(notification._id)}
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
    )
}

export default SystemDashboard