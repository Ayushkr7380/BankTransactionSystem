import { useParams, useNavigate } from 'react-router-dom'
import { useAdminAccountDetail, useFreezeAccount, useUnfreezeAccount } from '../../hooks/useAdmin'
import { useState } from 'react'
import toast from 'react-hot-toast'
import Skeleton from '../Skeleton'

function SystemAccountDetail() {
    const { accountId } = useParams()
    const navigate = useNavigate()
    const [filter, setFilter] = useState('ALL')

    const { data, isLoading } = useAdminAccountDetail(accountId)
    const { mutate: freeze, isPending: freezing } = useFreezeAccount()
    const { mutate: unfreeze, isPending: unfreezing } = useUnfreezeAccount()

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">

                {/* Navbar */}
                <div className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg" />
                    <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 rounded-full" />
                </div>

                <div className="p-5 max-w-lg mx-auto flex flex-col gap-4">

                    {/* Balance Card */}
                    <Skeleton className="h-32 rounded-2xl" />

                    {/* Freeze/Unfreeze Action */}
                    <Skeleton className="h-16 rounded-xl" />

                    {/* Account Info */}
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                        <Skeleton className="h-4 w-24 mb-4" />

                        <div className="space-y-3">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
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

    const filteredTxns = transactions.filter(txn => {
        if (filter === 'ALL') return true
        return txn.type === filter
    })

    

    return (
        <div className="min-h-screen bg-gray-50">

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
                        {account?.upiId} · {account?.user?.name}
                    </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                    account?.status === 'ACTIVE'
                        ? 'bg-green-50 text-green-600'
                        : account?.status === 'FROZEN'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-red-50 text-red-500'
                }`}>
                    {account?.status}
                </span>
            </nav>

            <div className="p-5 max-w-lg mx-auto flex flex-col gap-4">

                {/* Balance Card */}
                <div className="bg-gray-900 rounded-2xl p-5 text-white">
                    <p className="text-xs text-gray-400 mb-1">Balance</p>
                    <p className="text-3xl font-semibold">
                        ₹{account?.balance.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        {account?.currency} · {account?.accountNumber}
                    </p>
                </div>

                {/* Freeze / Unfreeze Button */}
                {account?.status === 'ACTIVE' ? (
                    <button
                        onClick={() => freeze(accountId, {
                            onSuccess: () => toast.success('Account frozen!'),
                            onError: (err) => toast.error(err.response?.data?.message ?? 'Failed')
                        })}
                        disabled={freezing}
                        className="bg-white border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-red-50 transition disabled:opacity-50"
                    >
                        <span className="text-xl">🔒</span>
                        <div>
                            <p className="text-sm font-medium text-red-600">
                                Freeze Account
                            </p>
                            <p className="text-xs text-gray-400">
                                Block all transactions
                            </p>
                        </div>
                    </button>
                ) : account?.status === 'FROZEN' ? (
                    <button
                        onClick={() => unfreeze(accountId, {
                            onSuccess: () => toast.success('Account unfrozen!'),
                            onError: (err) => toast.error(err.response?.data?.message ?? 'Failed')
                        })}
                        disabled={unfreezing}
                        className="bg-white border border-green-100 rounded-xl px-4 py-3 flex items-center gap-3 text-left hover:bg-green-50 transition disabled:opacity-50"
                    >
                        <span className="text-xl">🔓</span>
                        <div>
                            <p className="text-sm font-medium text-green-600">
                                Unfreeze Account
                            </p>
                            <p className="text-xs text-gray-400">
                                Restore transactions
                            </p>
                        </div>
                    </button>
                ) : null}

                {/* Account Info */}
                <div className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Account Info
                    </p>
                    {[
                        { label: 'Owner', value: account?.user?.name },
                        { label: 'Email', value: account?.user?.email },
                        { label: 'UPI ID', value: account?.upiId },
                        { label: 'Account No', value: account?.accountNumber },
                        { label: 'Primary', value: account?.isPrimary ? 'Yes' : 'No' },
                        { label: 'Since', value: new Date(account?.createdAt).toLocaleDateString('en-IN') }
                    ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between">
                            <p className="text-xs text-gray-400">{label}</p>
                            <p className="text-sm text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Transactions */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            Transactions
                        </p>
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
                                No transactions
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
                                        {txn.type === 'DEBIT' ? '↑' : '↓'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {txn.type === 'SYSTEM_CAPITAL'
                                                ? 'Initial Deposit'
                                                : txn.type
                                            }
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {new Date(txn.createdAt).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                </div>
                                <p className={`text-sm font-medium ${
                                    txn.type === 'DEBIT'
                                        ? 'text-red-500'
                                        : 'text-green-600'
                                }`}>
                                    {txn.type === 'DEBIT' ? '−' : '+'} ₹{txn.amount.toLocaleString('en-IN')}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SystemAccountDetail