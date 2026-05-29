import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import API from '../api/axios'
import { useGetMyAccounts } from '../hooks/useAccounts'
import generateIdempotencyKey from '../utils/generateIdempotencyKey'

function ChatPage() {
    const { userId } = useParams()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const chatEndRef = useRef(null)
    const idempotencyKeyRef = useRef(null)

    const [showForm, setShowForm] = useState(false)
    const [form, setForm] = useState({
        fromAccount: '',
        amount: ''
    })

    // Chat transactions fetch
    const { data, isLoading } = useQuery({
        queryKey: ['chat', userId],
        queryFn: () => API.get(`/transactions/chat/${userId}`),
        select: (res) => res.data
    })

    // My accounts
    const { data: accounts = [] } = useGetMyAccounts()

    const transactions = data?.transactions ?? []
    const myAccountIds = data?.myAccountIds ?? []
    const theirPrimaryAccountId = data?.theirPrimaryAccountId
    const otherUserName = data?.otherUserName ?? 'User'
    const otherUserUpi = data?.otherUserUpi ?? ''

    // Default fromAccount — primary account
    useEffect(() => {
        const primary = accounts.find(acc => acc.isPrimary)
        if (primary) {
            setForm(prev => ({ ...prev, fromAccount: primary._id }))
        }
    }, [accounts])

    // Auto scroll to bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [transactions])

    // Send money mutation
    const { mutate, isPending } = useMutation({
        mutationFn: (data) => API.post('/transactions/create', data),

        onSuccess: () => {
            idempotencyKeyRef.current = null
            setForm(prev => ({ ...prev, amount: '' }))
            setShowForm(false)
            queryClient.invalidateQueries(['chat', userId])
            queryClient.invalidateQueries(['accounts'])
            toast.success('Money sent successfully!')
        },

        onError: (error) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    })

    const handlePay = () => {
        if (!form.fromAccount || !form.amount) {
            toast.error('Select account and enter amount')
            return
        }

        if (!idempotencyKeyRef.current) {
            idempotencyKeyRef.current = generateIdempotencyKey(
                form.fromAccount,
                theirPrimaryAccountId
            )
        }

        mutate({
            fromAccount: form.fromAccount,
            toAccount: theirPrimaryAccountId,
            amount: Number(form.amount),
            idempotencyKey: idempotencyKeyRef.current
        })
    }

    // Date divider helper
    const formatDate = (dateStr) => {
        const date = new Date(dateStr)
        const today = new Date()
        const yesterday = new Date()
        yesterday.setDate(today.getDate() - 1)

        if (date.toDateString() === today.toDateString()) return 'Today'
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
        return date.toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
    }

    // Group transactions by date
    const groupedTransactions = transactions.reduce((groups, txn) => {
        const date = formatDate(txn.createdAt)
        if (!groups[date]) groups[date] = []
        groups[date].push(txn)
        return groups
    }, {})

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-sm text-gray-400">Loading...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-100 px-5 h-14 flex items-center gap-3 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="w-8 h-8 border border-gray-100 rounded-lg flex items-center justify-center"
                >
                    ←
                </button>
                <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-xs font-semibold text-green-700">
                    {otherUserName?.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                        {otherUserName}
                    </p>
                    <p className="text-xs text-gray-400">
                        {otherUserUpi} · {transactions.length} transactions
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-gray-900 text-white text-xs px-4 py-1.5 rounded-lg"
                >
                    Pay
                </button>
            </nav>

            {/* Chat Area */}
            <div className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">

                {transactions.length === 0 && (
                    <div className="flex-1 flex items-center justify-center py-20">
                        <p className="text-sm text-gray-400 text-center">
                            No transactions yet{'\n'}Send money to start!
                        </p>
                    </div>
                )}

                {Object.entries(groupedTransactions).map(([date, txns]) => (
                    <div key={date}>

                        {/* Date Divider */}
                        <div className="text-center text-xs text-gray-400 py-2">
                            {date}
                        </div>

                        {txns.map(txn => {
                            const isSent = myAccountIds.includes(txn.fromAccount?._id)

                            return (
                                <div
                                    key={txn._id}
                                    className={`flex mb-2 ${isSent ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl ${
                                        isSent
                                            ? 'bg-gray-900 text-white rounded-br-sm'
                                            : 'bg-white border border-gray-100 text-gray-900 rounded-bl-sm'
                                    }`}>
                                        {/* Amount */}
                                        <p className="text-lg font-semibold">
                                            {isSent ? '−' : '+'} ₹{txn.amount.toLocaleString('en-IN')}
                                        </p>

                                        {/* UPI Route */}
                                        <p className={`text-xs mt-0.5 ${isSent ? 'text-gray-400' : 'text-gray-400'}`}>
                                            {txn.fromAccount?.upiId} → {txn.toAccount?.upiId}
                                        </p>

                                        {/* Time + Status */}
                                        <div className={`flex items-center gap-2 mt-1.5 text-xs ${isSent ? 'text-gray-500' : 'text-gray-400'}`}>
                                            <span>
                                                {new Date(txn.createdAt).toLocaleTimeString('en-IN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                            <span className="bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full text-xs">
                                                ✓ {txn.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ))}

                <div ref={chatEndRef} />
            </div>

            {/* Pay Trigger */}
            {!showForm && (
                <div className="bg-white border-t border-gray-100 p-3">
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full border border-dashed border-gray-200 rounded-lg py-2.5 text-sm text-gray-400 hover:border-gray-300 transition"
                    >
                        + Send money to {otherUserName}
                    </button>
                </div>
            )}

            {/* Pay Form */}
            {showForm && (
                <div className="bg-white border-t border-gray-100 p-4 flex flex-col gap-3">

                    {/* From Account Select */}
                    <select
                        value={form.fromAccount}
                        onChange={(e) => {
                            setForm(prev => ({ ...prev, fromAccount: e.target.value }))
                            idempotencyKeyRef.current = null  // Reset key on account change
                        }}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50"
                    >
                        <option value="">Select your account</option>
                        {accounts.map(acc => (
                            <option key={acc._id} value={acc._id}>
                                {acc.nickname} — ₹{acc.balance.toLocaleString('en-IN')}
                                {acc.isPrimary ? ' (Primary)' : ''}
                            </option>
                        ))}
                    </select>

                    {/* Amount + Buttons */}
                    <div className="flex gap-2">
                        <input
                            type="number"
                            placeholder="Amount ₹"
                            value={form.amount}
                            onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none bg-gray-50"
                        />
                        <button
                            onClick={() => {
                                setShowForm(false)
                                idempotencyKeyRef.current = null
                            }}
                            className="border border-gray-200 text-gray-500 text-sm px-4 py-2 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePay}
                            disabled={isPending}
                            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            {isPending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ChatPage