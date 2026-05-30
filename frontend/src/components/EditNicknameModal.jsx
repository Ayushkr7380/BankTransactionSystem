import { useState } from 'react'
import { useUpdateNickname } from '../hooks/useAccounts'
import toast from 'react-hot-toast'

function EditNicknameModal({ account, onClose }) {
    const [nickname, setNickname] = useState(account?.nickname ?? '')

    const { mutate, isPending } = useUpdateNickname()

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!nickname.trim()) {
            toast.error('Nickname cannot be empty')
            return
        }

        mutate({ accountId: account._id, nickname }, {
            onSuccess: () => {
                toast.success('Nickname updated!')
                onClose()
            },
            onError: (error) => {
                toast.error(error.response?.data?.message ?? 'Something went wrong')
            }
        })
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center px-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">

                <div className="flex justify-between items-center mb-5">
                    <h3 className="text-base font-medium text-gray-900">
                        Edit Nickname
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-lg"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">
                            Account nickname
                        </label>
                        <input
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="e.g. Savings, Travel Fund"
                            maxLength={30}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                        />
                        <p className="text-xs text-gray-300 text-right">
                            {nickname.length}/30
                        </p>
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
                            disabled={isPending || nickname === account?.nickname}
                            className="flex-1 bg-gray-900 text-white text-sm py-2.5 rounded-xl disabled:opacity-50"
                        >
                            {isPending ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditNicknameModal