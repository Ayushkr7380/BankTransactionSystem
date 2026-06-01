import { useDashboard } from '../hooks/useDashboard'
// import { useLogout } from '../hooks/useAuth'
import { Link , useNavigate} from 'react-router-dom'
import CreateAccountModal from './CreateAccountModal'
import { useState } from 'react'
import { useSetPrimary } from '../hooks/useAccounts'
import toast from 'react-hot-toast'

function DashboardPage() {

    const [showModal, setShowModal] = useState(false) 

    const navigate = useNavigate();

    const {
        user, accounts, transactions,
        myAccountIds, totalBalance,
        sentThisMonth, receivedThisMonth,
        isLoading
    } = useDashboard()

    // const { mutate: logout } = useLogout()
   const { mutate: setPrimary, isPending } = useSetPrimary()


    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-100 px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l9-3 9 3v6c0 5-4 8-9 9-5-1-9-4-9-9V6z"/>
                        </svg>
                    </div>
                    <span className="text-sm font-medium">LedgerPay</span>
                </div>

                
                <button
                    onClick={() => navigate('/profile')}
                    className="w-8 h-8 rounded-full bg-green-50 border border-gray-100 flex items-center justify-center text-xs font-medium text-green-700"
                >
                    {user?.name?.slice(0, 2).toUpperCase()}
                </button>

                
            </nav>

            <div className="p-6 flex flex-col gap-5 max-w-lg mx-auto">

                {/* Greeting */}
                <div>
                    <p className="text-lg font-medium text-gray-900">
                        Good morning, {user?.name?.split(' ')[0]}
                    </p>
                    <p className="text-sm text-gray-400 mt-0.5">
                        Here's your financial overview
                    </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { label: 'Total balance', value: totalBalance },
                        { label: 'Sent this month', value: sentThisMonth },
                        { label: 'Received', value: receivedThisMonth, green: true }
                    ].map(({ label, value, green }) => (
                        <div key={label} className="bg-gray-100 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">{label}</p>
                            <p className={`text-base font-medium ${green ? 'text-green-600' : 'text-gray-900'}`}>
                                ₹{value.toLocaleString('en-IN')}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Send Money Button */}
                <Link
                    to="/transfer"
                    className="bg-gray-900 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                    </svg>
                    Send money
                </Link>

                {/* Accounts */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-900">My accounts</p>
                        {accounts.length < 3 && (
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-xs text-blue-600"
                            >
                                + New account
                            </button>
                        )}
                    </div>
                    {showModal && (
                        <CreateAccountModal onClose={() => setShowModal(false)} />
                    )}
                    <div className="flex flex-col gap-2">
                        {accounts.map(acc => {
                            const isFrozen = acc.status === 'FROZEN'
                            return (
                                <div
                                    key={acc._id}
                                    className={`border rounded-xl px-4 py-3 ${
                                        isFrozen
                                            ? 'bg-gray-50 border-gray-200 opacity-75'
                                            : 'bg-white border-gray-100'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            {/* 🔒 Frozen icon */}
                                            {isFrozen && (
                                                <svg className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                                                </svg>
                                            )}
                                            <div>
                                                <p className={`text-sm font-medium ${isFrozen ? 'text-gray-400' : 'text-gray-900'}`}>
                                                    {acc.nickname}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    {acc.upiId}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <p className={`text-sm font-medium ${isFrozen ? 'text-gray-400' : 'text-gray-900'}`}>
                                                ₹{acc.balance.toLocaleString('en-IN')}
                                            </p>

                                            {/* Status badge / action */}
                                            {isFrozen ? (
                                                <span className="text-xs bg-red-50 text-red-400 px-2 py-0.5 rounded-full">
                                                    Frozen
                                                </span>
                                            ) : acc.isPrimary ? (
                                                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                                                    Primary
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setPrimary(acc._id, {
                                                        onSuccess: () => toast.success('Primary account updated!'),
                                                        onError: (error) => toast.error(
                                                            error.response?.data?.message ?? 'Something went wrong'
                                                        )
                                                    })}
                                                    disabled={isPending}
                                                    className="text-xs text-gray-400 hover:text-blue-600 transition disabled:opacity-50"
                                                >
                                                    {isPending ? 'Saving...' : 'Set as primary'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Frozen notice strip */}
                                    {isFrozen && (
                                        <p className="text-xs text-red-400 mt-2 pt-2 border-t border-gray-100">
                                            This account is frozen. Contact support to reactivate.
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Recent Transactions */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-900">Recent transactions</p>
                        <Link to="/transactions" className="text-xs text-blue-600">View all</Link>
                    </div>
                    <div className="flex flex-col rounded-xl overflow-hidden border border-gray-100">
                        {transactions.slice(0, 5).map(txn => {
                            const isSent = myAccountIds.includes(txn.fromAccount?._id)
                            return (
                                <div key={txn._id} className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${isSent ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                            {isSent ? '↑' : '↓'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {isSent ? 'Sent' : 'Received'}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(txn.createdAt).toLocaleDateString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                    <p className={`text-sm font-medium ${isSent ? 'text-red-500' : 'text-green-600'}`}>
                                        {isSent ? '−' : '+'} ₹{txn.amount.toLocaleString('en-IN')}
                                    </p>
                                </div>
                            )
                        })}
                        {transactions.length === 0 && (
                            <div className="bg-white px-4 py-6 text-center text-sm text-gray-400">
                                No transactions yet
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}

export default DashboardPage