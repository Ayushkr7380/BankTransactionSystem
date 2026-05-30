import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { searchByUpiApi } from '../api/account.api'
// import { getMyTransactionsApi } from '../api/transaction.api'
import { useDashboard } from '../hooks/useDashboard'

function TransferPage() {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')

    const { data: searchData } = useQuery({
        queryKey: ['upi-search', query],
        queryFn: () => searchByUpiApi(query),
        enabled: query.length > 3,
        select: (data) => data.data
    })

    const { transactions, myAccountIds } = useDashboard()

    const searchResult = searchData?.account

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
                    Send money
                </span>
            </nav>

            <div className="p-5 flex flex-col gap-5 max-w-lg mx-auto">

                {/* Search Bar */}
                <div>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            🔍
                        </span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search by UPI ID e.g. rahul@ledger"
                            className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                        />
                    </div>

                    {/* Search Result */}
                    {searchResult && (
                        <div className="mt-2 bg-white border border-blue-100 rounded-xl px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center text-xs font-medium text-green-700">
                                    {searchResult.userName?.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {searchResult.userName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {searchResult.upiId}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate(`/chat/${searchResult.userId}`)}
                                className="bg-gray-900 text-white text-xs px-4 py-1.5 rounded-lg"
                            >
                                Pay
                            </button>
                        </div>
                    )}

                    {/* Not Found */}
                    {query.length > 3 && !searchResult && (
                        <p className="text-xs text-gray-400 mt-2 px-1">
                            No account found with this UPI ID
                        </p>
                    )}
                </div>

                {/* Recent Transactions */}
                <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">
                        Recent transactions
                    </p>

                    <div className="flex flex-col rounded-xl overflow-hidden border border-gray-100">
                        {transactions.length === 0 && (
                            <div className="bg-white px-4 py-6 text-center text-sm text-gray-400">
                                No transactions yet
                            </div>
                        )}

                        {transactions.slice(0, 10).map(txn => {
                            const isSent = myAccountIds.includes(txn.fromAccount?._id)
                            console.log(isSent)
                            console.log("asda",txn.fromAccount);
                            
                            // UserId for navigation
                            const chatUserId = isSent
                                ? txn.toAccount?.user   
                                : txn.fromAccount?.user

                            return (
                                <div
                                    key={txn._id}
                                    onClick={() => navigate(`/chat/${chatUserId}`)}
                                    className="bg-white px-4 py-3 flex items-center justify-between border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isSent
                                            ? 'bg-red-50 text-red-500'
                                            : 'bg-green-50 text-green-600'
                                        }`}>
                                            {isSent ? '↑' : '↓'}
                                        </div>
                                        <div>
                                            
                                            <p className="text-sm font-medium text-gray-900">
                                                {isSent
                                                    ? txn.toAccount?.upiId
                                                    : txn.fromAccount?.upiId
                                                }
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(txn.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-medium ${isSent
                                        ? 'text-red-500'
                                        : 'text-green-600'
                                    }`}>
                                        {isSent ? '−' : '+'} ₹{txn.amount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TransferPage