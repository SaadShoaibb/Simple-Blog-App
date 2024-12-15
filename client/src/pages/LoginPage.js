import { useContext, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const { setUserInfo } = useContext(UserContext);
    
    async function login(ev) {
        ev.preventDefault();
        const response = await fetch('http://localhost:4000/login', {
            method: 'POST',
            body: JSON.stringify({ username, password }),
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        });
        if (response.ok) {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
                setRedirect(true);
            });
        } else {
            alert('Wrong Credentials :(');
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }
    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={login}>
                <h1 className="form-title">Login</h1>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input id="username" type="text" placeholder="Enter your username" value={username} onChange={ev => setUsername(ev.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" placeholder="Enter your password" value={password} onChange={ev => setPassword(ev.target.value)} />
                </div>
                <button className="auth-button">Login</button>
            </form>
        </div>
    );
}








