import { useParams, useNavigate } from 'react-router-dom'
import { useAdminUserDetail } from '../../hooks/useAdmin'

function SystemUserDetail() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const { data, isLoading } = useAdminUserDetail(userId)

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
        </div>
    )

    const user = data?.user
    const accounts = data?.accounts ?? []
    const transactions = data?.transactions ?? []
    const totalBalance = data?.totalBalance ?? 0

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
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
            </nav>

            <div className="p-5 max-w-lg mx-auto flex flex-col gap-4">

                {/* Total Balance */}
                <div className="bg-gray-900 rounded-2xl p-5 text-white">
                    <p className="text-xs text-gray-400 mb-1">Total balance</p>
                    <p className="text-3xl font-semibold">
                        ₹{totalBalance.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        Across {accounts.length} accounts
                    </p>
                </div>

                {/* Accounts */}
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Accounts
                    </p>
                    <div className="flex flex-col gap-2">
                        {accounts.map(acc => (
                            <div
                                key={acc._id}
                                onClick={() => navigate(`/system/accounts/${acc._id}`)}
                                className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {acc.nickname}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {acc.upiId}
                                    </p>
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

                {/* Transactions */}
                <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                        Transactions
                    </p>
                    <div className="flex flex-col rounded-xl overflow-hidden border border-gray-100">
                        {transactions.length === 0 && (
                            <div className="bg-white px-4 py-6 text-center text-sm text-gray-400">
                                No transactions yet
                            </div>
                        )}
                        {transactions.map(txn => {
                            const isSent = accounts.some(
                                acc => acc._id === txn.fromAccount?._id
                            )
                            return (
                                <div
                                    key={txn._id}
                                    className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-50 last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                            isSent
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
                                    <div className="text-right">
                                        <p className={`text-sm font-medium ${
                                            isSent ? 'text-red-500' : 'text-green-600'
                                        }`}>
                                            {isSent ? '−' : '+'} ₹{txn.amount.toLocaleString('en-IN')}
                                        </p>
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                            txn.status === 'COMPLETED'
                                                ? 'bg-green-50 text-green-600'
                                                : txn.status === 'PENDING'
                                                ? 'bg-yellow-50 text-yellow-600'
                                                : 'bg-red-50 text-red-500'
                                        }`}>
                                            {txn.status}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SystemUserDetail