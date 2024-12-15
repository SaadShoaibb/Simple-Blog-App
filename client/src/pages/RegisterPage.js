import React, { useState } from 'react';


const RegisterPage = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function register(event) {
        event.preventDefault();
        const response = await fetch('http://localhost:4000/register', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.status === 200) {
            alert('registration successful');
        } else {
            alert('registration failed');
        }
    }



    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={register}>
                <h1 className="form-title">Register</h1>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" placeholder="Enter your username" value={username} onChange={event => setUsername(event.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" placeholder="Enter your password" value={password} onChange={event => setPassword(event.target.value)} />
                </div>
                <button className="auth-button">Register</button>
            </form>
        </div>
    );
};

export default RegisterPage;
