import { useState } from "react";
import { useRegister } from "../../hooks/useAuth";
import { Link } from "react-router-dom";

function Registration() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        systemUser: false,
        systemSecretKey: ""
    })

    const { mutate, isPending, isError, error } = useRegister()

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        mutate(form)
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 w-full max-w-md">

                {/* Logo */}
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l9-3 9 3v6c0 5-4 8-9 9-5-1-9-4-9-9V6z"/>
                    </svg>
                </div>

                <h2 className="text-xl font-medium text-center text-gray-900 mb-1">
                    Create account
                </h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    Start managing your finances today
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Name */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">Full name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Ayush Kumar"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">Email address</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="ayush@example.com"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                        />
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Min. 6 characters"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                        />
                    </div>

                    {/* System User Checkbox */}
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            name="systemUser"
                            checked={form.systemUser}
                            onChange={handleChange}
                            className="rounded"
                        />
                        Register as system user
                    </label>

                    {/* Secret Key — sirf tab dikhao */}
                    {form.systemUser && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500">System secret key</label>
                                <input
                                    type="password"
                                    name="systemSecretKey"
                                    value={form.systemSecretKey}
                                    onChange={handleChange}
                                    placeholder="Enter secret key"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                                />
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {isError && (
                        <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">
                            
                            <span>{error.response?.data?.message}</span>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-gray-900 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isPending ? 'Registering...' : 'Register'}
                    </button>

                </form>

                <div className="flex items-center gap-2 my-4">
                    <hr className="flex-1 border-gray-100" />
                    <span className="text-xs text-gray-400">or</span>
                    <hr className="flex-1 border-gray-100" />
                </div>

                <p className="text-center text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Registration;