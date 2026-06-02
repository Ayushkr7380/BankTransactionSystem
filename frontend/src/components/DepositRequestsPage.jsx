import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Skeleton from '../components/Skeleton'
import { useMyDepositRequests } from '../hooks/useMyDepositRequest'

function DepositRequestsPage() {
    const navigate = useNavigate()
    const [filter, setFilter] = useState('ALL')

    const {
        data: requests = [],
        isLoading
    } = useMyDepositRequests()

    const filteredRequests = requests.filter(request => {
        if (filter === 'ALL') return true
        return request.status === filter
    })

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">

                <div className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                    <div className="ml-auto">
                        <Skeleton className="h-4 w-16" />
                    </div>
                </div>

                <div className="p-5 max-w-lg mx-auto flex flex-col gap-3">
                    <div className="flex gap-2">
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                    </div>

                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
                    <Skeleton className="h-24 rounded-xl" />
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
                    Deposit Requests
                </span>

                <span className="text-xs text-gray-400 ml-auto">
                    {requests.length} total
                </span>
            </nav>

            <div className="p-5 max-w-lg mx-auto flex flex-col gap-3">

                {/* Filters */}
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`text-xs px-3 py-1.5 rounded-full transition ${
                                filter === f
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-white border border-gray-200 text-gray-500'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {filteredRequests.length === 0 && (
                    <div className="bg-white border border-gray-100 rounded-xl px-4 py-8 text-center">
                        <p className="text-sm text-gray-400">
                            No requests found
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-2">

                    {filteredRequests.map(request => (
                        <div
                            key={request._id}
                            className="bg-white border border-gray-100 rounded-xl p-4"
                        >
                            <div className="flex justify-between items-start">

                                <div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        ₹{request.amount.toLocaleString('en-IN')}
                                    </p>

                                    <p className="text-sm text-gray-600 mt-1">
                                        {request.account?.nickname}
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        {request.account?.upiId}
                                    </p>
                                </div>

                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                        request.status === 'APPROVED'
                                            ? 'bg-green-50 text-green-600'
                                            : request.status === 'PENDING'
                                            ? 'bg-yellow-50 text-yellow-600'
                                            : 'bg-red-50 text-red-500'
                                    }`}
                                >
                                    {request.status}
                                </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-100">

                                <p className="text-xs text-gray-500">
                                    Requested:
                                    {' '}
                                    {new Date(
                                        request.createdAt
                                    ).toLocaleString('en-IN')}
                                </p>

                                {request.processedAt && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Processed:
                                        {' '}
                                        {new Date(
                                            request.processedAt
                                        ).toLocaleString('en-IN')}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    )
}

export default DepositRequestsPage