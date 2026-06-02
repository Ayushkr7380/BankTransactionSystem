import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import API from '../api/axios'
import toast from 'react-hot-toast'

function RequestDepositModal({ account, onClose }) {
    const [amount, setAmount] = useState('')

    const { mutate, isPending } = useMutation({
        mutationFn: (data) => API.post('/depositRequest/deposit-request', data),

        onSuccess: () => {
            toast.success('Deposit request sent to admin!')
            onClose()
        },

        onError: (error) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!amount || Number(amount) <= 0) {
            toast.error('Enter a valid amount')
            return
        }

        mutate({
            account: account._id,
            amount: Number(amount)
        })
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center px-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">

                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-medium text-gray-900">
                        Request Deposit
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Account Info */}
                <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
                    <p className="text-xs text-gray-400">Depositing to</p>
                    <p className="text-sm font-medium text-gray-900 mt-0.5">
                        {account?.nickname}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {account?.upiId}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">Amount</label>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition">
                            <span className="px-3 py-2 text-sm text-gray-400 bg-gray-50 border-r border-gray-200">
                                ₹
                            </span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0.00"
                                min="1"
                                className="flex-1 px-3 py-2 text-sm outline-none"
                            />
                        </div>
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2">
                        {[500, 1000, 5000, 10000].map(amt => (
                            <button
                                key={amt}
                                type="button"
                                onClick={() => setAmount(String(amt))}
                                className={`flex-1 text-xs py-1.5 rounded-lg border transition ${
                                    Number(amount) === amt
                                        ? 'bg-gray-900 text-white border-gray-900'
                                        : 'border-gray-200 text-gray-500'
                                }`}
                            >
                                ₹{amt >= 1000 ? `${amt/1000}k` : amt}
                            </button>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-200 text-gray-500 text-sm py-2.5 rounded-xl"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !amount}
                            className="flex-1 bg-gray-900 text-white text-sm py-2.5 rounded-xl disabled:opacity-50"
                        >
                            {isPending ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RequestDepositModal