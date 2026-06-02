import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAccountDetail, useSetPrimary } from '../hooks/useAccounts'
import EditNicknameModal from '../components/EditNicknameModal'
import RequestDepositModal from '../components/RequestDepositModal'
import toast from 'react-hot-toast'
import Skeleton from '../components/Skeleton'

function AccountDetailPage() {
    const { accountId } = useParams()
    const navigate = useNavigate()
    const [showBalance, setShowBalance] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDepositModal, setShowDepositModal] = useState(false)
    const [filter, setFilter] = useState('ALL') 

    const { data, isLoading } = useAccountDetail(accountId)
    const { mutate: setPrimary, isPending } = useSetPrimary()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">

                {/* Navbar */}
                <div className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto">

                    {/* Balance Card */}
                    <Skeleton className="h-36 rounded-2xl" />

                    {/* Quick Actions */}
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />
                    <Skeleton className="h-16 rounded-xl" />

                    {/* Account Info */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                        <Skeleton className="h-4 w-24 mb-4" />
                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                        </div>
                    </div>

                    {/* Transactions */}
                    <div>
                        <Skeleton className="h-4 w-28 mb-3" />

                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-16 rounded-xl" />
                            <Skeleton className="h-16 rounded-xl" />
                            <Skeleton className="h-16 rounded-xl" />
                            <Skeleton className="h-16 rounded-xl" />
                        </div>
                    </div>

                </div>
            </div>
        )
    }

    const account = data?.account
    const transactions = data?.transactions ?? []

    // Filter transactions
    const filteredTxns = transactions.filter(txn => {
        if (filter === 'ALL') return true
        return txn.type === filter
    })


    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied!`)
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
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                        {account?.nickname}
                    </p>
                    <p className="text-xs text-gray-400">
                        {account?.upiId}
                    </p>
                </div>
                <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                    {account?.status}
                </span>
            </nav>

            <div className="p-5 flex flex-col gap-4 max-w-lg mx-auto">

                {/* Balance Card */}
                <div className="bg-gray-900 rounded-2xl p-6 text-white">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-xs text-gray-400">Current Balance</p>
                        <button
                            onClick={() => setShowBalance(prev => !prev)}
                            className="text-gray-400 text-sm"
                        >
                            {showBalance ? '👁️' : '🙈'}
                        </button>
                    </div>
                    <p className="text-3xl font-semibold">
                        {showBalance
                            ? `₹${account?.balance.toLocaleString('en-IN')}`
                            : '₹ ••••••'
                        }
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        {account?.currency} Account
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition"
                    >
                        <span className="text-xl">💸</span>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Request Deposit
                            </p>
                            <p className="text-xs text-gray-400">
                                Request funds from admin
                            </p>
                        </div>
                    </button>

                    <button
                        onClick={() => setShowEditModal(true)}
                        className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition"
                    >
                        <span className="text-xl">✏️</span>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Edit Nickname
                            </p>
                            <p className="text-xs text-gray-400">
                                Change account name
                            </p>
                        </div>
                    </button>

                    {!account?.isPrimary && (
                        <button
                            onClick={() => setPrimary(accountId, {
                                onSuccess: () => toast.success('Primary account updated!'),
                                onError: (err) => toast.error(err.response?.data?.message ?? 'Failed')
                            })}
                            disabled={isPending}
                            className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            <span className="text-xl">⭐</span>
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Set as Primary
                                </p>
                                <p className="text-xs text-gray-400">
                                    Use as default account
                                </p>
                            </div>
                        </button>
                    )}
                </div>

                {/* Account Info */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Account Info
                    </p>

                    {[
                        { label: 'Account No', value: account?.accountNumber },
                        { label: 'UPI ID', value: account?.upiId },
                        { label: 'Status', value: account?.status },
                        { label: 'Member Since', value: new Date(account?.createdAt).toLocaleDateString('en-IN') }
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-center">
                            <p className="text-xs text-gray-400">{label}</p>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-900">{value}</p>
                                {(label === 'Account No' || label === 'UPI ID') && (
                                    <button
                                        onClick={() => copyToClipboard(value, label)}
                                        className="text-xs text-blue-500"
                                    >
                                        Copy
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Transactions */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            Transactions
                        </p>
                        {/* Filter */}
                        <div className="flex gap-1">
                            {['ALL', 'CREDIT', 'DEBIT'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`text-xs px-3 py-1 rounded-full transition ${
                                        filter === f
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col rounded-xl overflow-hidden border border-gray-100">
                        {filteredTxns.length === 0 && (
                            <div className="bg-white px-4 py-6 text-center text-sm text-gray-400">
                                No transactions yet
                            </div>
                        )}

                        {filteredTxns.map(txn => (
                            <div
                                key={txn._id}
                                className="bg-white px-4 py-3 flex justify-between items-center border-b border-gray-50 last:border-0"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                        txn.type === 'CREDIT' || txn.type === 'SYSTEM_CAPITAL'
                                            ? 'bg-green-50 text-green-600'
                                            : 'bg-red-50 text-red-500'
                                    }`}>
                                        {txn.type === 'CREDIT' || txn.type === 'SYSTEM_CAPITAL' ? '↓' : '↑'}
                                    </div>
                                    <div>
                                        {/* <p className="text-sm font-medium text-gray-900">
                                            {txn.type === 'SYSTEM_CAPITAL'
                                                ? 'Account Funding'
                                                : txn.type === 'CREDIT'
                                                ? 'Received'
                                                : 'Sent'
                                            }
                                        </p> */}

                                        <p className="text-sm font-medium text-gray-900">
                                            {txn.type === 'CREDIT'
                                                ? `From ${txn.transaction?.fromAccount?.upiId}`
                                                : `To ${txn.transaction?.toAccount?.upiId}`
                                            }
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(txn.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                <p className={`text-sm font-medium ${
                                    txn.type === 'CREDIT' || txn.type === 'SYSTEM_CAPITAL'
                                        ? 'text-green-600'
                                        : 'text-red-500'
                                }`}>
                                    {txn.type === 'DEBIT' ? '−' : '+'} ₹{txn.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showEditModal && (
                <EditNicknameModal
                    account={account}
                    onClose={() => setShowEditModal(false)}
                />
            )}
            {showDepositModal && (
                <RequestDepositModal
                    account={account}
                    onClose={() => setShowDepositModal(false)}
                />
            )}
        </div>
    )
}

export default AccountDetailPage