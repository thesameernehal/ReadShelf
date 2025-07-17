import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email: email.trim(),
                password,
            });

            // Store user in localStorage
            localStorage.setItem('user', JSON.stringify(res.data.user));
            setMessage('Login Successfully !!!');
            console.log('Logged in User : ', res.data.user);
        } catch (err) {
            console.error(err);
            setMessage(err.response?.data?.message || 'Login Failed');
        }
    };

    return (
        <div>
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />

                <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />

                <button type='submit'>Login</button>

                {/* Message */}
                {message && <p>{message}</p>}
            </form>
        </div>
    )
}

export default Login
