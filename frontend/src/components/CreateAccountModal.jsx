import { useState } from "react"
import { useCreateAccount } from "../hooks/useAccounts"

function CreateAccountModal({ onClose }) {
    const [form, setForm] = useState({
        nickname: "",
        upiId: "",

    })

    const { mutate, isPending, isError, error } = useCreateAccount()

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        mutate(form, {
            onSuccess: () => onClose()
        })
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">

                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-medium text-gray-900">
                        New account
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">
                            Account nickname
                        </label>
                        <input
                            name="nickname"
                            value={form.nickname}
                            onChange={handleChange}
                            placeholder="e.g. Savings, Travel Fund"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">UPI ID</label>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition">
                            <input
                                name="upiId"
                                value={form.upiId}
                                onChange={handleChange}
                                placeholder="ayush.savings"
                                className="flex-1 px-3 py-2 text-sm outline-none"
                            />
                            
                        </div>
                        <p className="text-xs text-gray-400">
                            Final: {form.upiId ? `${form.upiId}` : 'ayush.savings@ledger'}
                        </p>
                    </div>

                    {isError && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                           
                            <span>{error.response?.data?.message}</span>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        {isPending ? 'Creating...' : 'Create account'}
                    </button>

                </form>
            </div>
        </div>
    )
}

export default CreateAccountModal