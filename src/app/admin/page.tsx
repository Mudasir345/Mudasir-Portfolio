"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "@/actions/admin";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export default function AdminLogin() {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const isValid = await authenticate(password);
            if (isValid) {
                router.push("/admin/dashboard");
            } else {
                setError("Invalid Password");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#030014] overflow-hidden relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/20 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md p-8 glass-card rounded-2xl border border-white/10 shadow-2xl"
            >
                <div className="flex flex-col items-center mb-6">
                    <div className="p-3 rounded-full bg-white/5 border border-white/10 mb-4">
                        <Lock className="text-cyan-400" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-gray-400 text-sm mt-1">Enter your credentials to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            placeholder="Enter Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-[#030014]/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-gray-500"
                        />
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center bg-red-500/10 py-1 px-2 rounded border border-red-500/20">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-[#030014] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/25"
                    >
                        {loading ? "Authenticating..." : "Login to Dashboard"}
                    </button>

                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        Back to Portfolio
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
