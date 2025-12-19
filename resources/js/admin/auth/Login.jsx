import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Loader2 } from "lucide-react";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Idempotency check
        if (isSubmitting) return;

        setIsSubmitting(true);

        try {
            const result = await login(email, password);
            if (result.success) {
                navigate("/admin/dashboard");
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError("An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-coffee-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-coffee-100">
                {/* Decorative Header */}
                <div className="bg-coffee-900 p-8 text-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                            <span className="text-3xl">☕</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                            ScanDine Admin
                        </h1>
                        <p className="text-coffee-200 mt-2 text-sm">
                            Coffee Shop Management System
                        </p>
                    </div>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-xl font-semibold text-coffee-800">
                            Welcome Back
                        </h2>
                        <p className="text-coffee-500 text-sm">
                            Please sign in to continue
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200 flex items-center">
                            <span className="mr-2">⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-coffee-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-coffee-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 bg-coffee-50/30 text-coffee-900 placeholder-coffee-300 transition-all"
                                    placeholder="admin@scandine.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-coffee-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-coffee-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    className="block w-full pl-10 pr-3 py-2.5 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 bg-coffee-50/30 text-coffee-900 placeholder-coffee-300 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white bg-coffee-600 hover:bg-coffee-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-coffee-500 transition-all duration-200 ${
                                isSubmitting
                                    ? "opacity-75 cursor-not-allowed"
                                    : ""
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>

                <div className="bg-coffee-50 px-8 py-4 text-center border-t border-coffee-100">
                    <p className="text-xs text-coffee-400">
                        &copy; {new Date().getFullYear()} ScanDine. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
