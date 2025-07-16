import React , {useState} from 'react'
import axios from 'axios'

const Register = () => {
    const [username, setUsername] = useState('')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', {
                username,
                name,
                email,
                password,
            })
            setMessage('User created Successfully !!!')
            console.log(res.data);
        } catch (err) {
            console.error(err);
            setMessage('Registration failed !!!')
        }
    }

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                {/* // Username  */}
                <input type="text" placeholder='Username' value={username} onChange={(e) => setUsername(e.target.value)} />

                {/* Name */}
                <input type="text" placeholder='Full Name' value={name} onChange={(e) => setName(e.target.value)} />

                {/* Email */}
                <input type="email" placeholder='Email' value={email} onChange={(e) => setEmail(e.target.value)} />

                {/* Password */}
                <input type="password" placeholder='Password' value={password} onChange={(e) => setPassword(e.target.value)} />

                <button type='submit'>Register</button>

                {message && <p>{message}</p>}
            </form>
        </div>
    )
}

export default Register
