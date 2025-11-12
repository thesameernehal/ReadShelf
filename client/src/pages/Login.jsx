import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/*
  Login.jsx
  - Preserves all original auth logic and localStorage handling.
  - Visual upgrade: split layout with quote/visual panel + form panel.
  - Theme: dark + teal accents to match app.
  - Responsive: stacks on small screens.
*/

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const { setUser } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", {
                email: email.trim(),
                password,
            });

            // Extract token and user safely (keeps your previous behavior)
            const token =
                res.data.token ||
                res.data.jwt ||
                res.data.accessToken ||
                (res.data.user && res.data.user.token) ||
                null;

            const userObj =
                res.data.user && typeof res.data.user === "object"
                    ? { ...res.data.user, token }
                    : {
                        id: res.data.id || "",
                        username: res.data.username || "",
                        email: res.data.email || "",
                        name: res.data.name || "",
                        token,
                    };

            // Save merged user object in localStorage
            localStorage.setItem("user", JSON.stringify(userObj));
            localStorage.setItem("token", userObj.token);
            setUser(userObj);
            setMessage("Login Successfully !!!");
            console.log("✅ Logged in User:", userObj);

            // Reload to refresh protected routes / state
            navigate('/');
            // window.location.reload();
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || "Login Failed");
        }
    };

    return (
        <div className="min-h-screen bg-[#071018] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left panel: quote / visual — decorative only */}
                <div className="hidden md:flex flex-col justify-center rounded-2xl p-8 bg-gradient-to-br from-[#071018] via-[#071722] to-[#06282b] border border-teal-700/20 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="text-4xl">📚</div>
                        <h3 className="text-2xl font-semibold text-teal-400">Welcome back</h3>
                    </div>

                    <blockquote className="italic text-gray-300 text-lg leading-relaxed">
                        “A book is a dream that you hold in your hand.”{" "}
                        <span className="block mt-4 text-sm text-gray-500">— Neil Gaiman</span>
                    </blockquote>

                    <p className="text-gray-400 mt-6">
                        Use your account to access personalized recommendations, track reading
                        progress, and manage your shelf. If you don't have an account yet,
                        register — it only takes a moment.
                    </p>

                    <div className="mt-8 flex gap-3">
                        <div className="w-10 h-10 rounded bg-teal-700/20 flex items-center justify-center text-teal-300">📖</div>
                        <div className="w-10 h-10 rounded bg-cyan-700/10 flex items-center justify-center text-cyan-300">✨</div>
                        <div className="w-10 h-10 rounded bg-teal-600/10 flex items-center justify-center text-teal-200">🕮</div>
                    </div>
                </div>

                {/* Right panel: form */}
                <div className="bg-[#0b1720] rounded-2xl p-8 shadow-xl border border-teal-700/20">
                    <h2 className="text-2xl font-semibold text-center text-white mb-6">
                        Login to <span className="text-teal-400">ReadShelf</span>
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-300 mb-2 block">Email</label>
                            <input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 bg-[#071018] text-gray-100 rounded-lg border border-teal-700/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-300 mb-2 block">Password</label>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 bg-[#071018] text-gray-100 rounded-lg border border-teal-700/20 focus:outline-none focus:ring-2 focus:ring-teal-400"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2 px-4 bg-gradient-to-r from-cyan-600 to-teal-500 hover:from-cyan-500 hover:to-teal-600 text-black font-semibold rounded-full transition"
                        >
                            Login
                        </button>

                        {/* Message */}
                        {message && (
                            <div className="text-center text-sm text-yellow-400 mt-2">{message}</div>
                        )}
                    </form>

                    <div className="mt-6 text-center text-gray-400">
                        Don't have an account?{" "}
                        <a href="/register" className="text-teal-400 hover:underline">
                            Register
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
