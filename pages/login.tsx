import React, { useState } from 'react';
import { useRouter } from 'next/router';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = () => {
        const validUsers: Record<string, string> = {
            gaboadmin: 'gaboadmin',
            mrayo123: 'mrayo123',
            nandods: 'nandods',
        };

        if (validUsers[username] === password) {
            localStorage.setItem('isAuthenticated', 'true');
            router.push('/');
        } else {
            setError('Credenciales inválidas');
        }
    };

    return (
        <div
            style={{
                backgroundImage: "url('/login_image.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            <form
                className="container"
                style={{
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
            >
                <div className="input-container">
                    <div className="input-content">
                        <div className="input-dist">
                            <div className="input-type">
                                <input
                                    className="input-is"
                                    type="text"
                                    required
                                    placeholder="User"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                                <input
                                    className="input-is"
                                    type="password"
                                    required
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                <button className="submit-button" type="submit">Log in</button>
            </form>
        </div>
    );
};

export default Login;
