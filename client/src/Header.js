import {Link} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {UserContext} from "./UserContext";

export default function Header() {
  const {setUserInfo,userInfo} = useContext(UserContext);
  useEffect(() => {
    fetch('http://localhost:4000/profile', {
      credentials: 'include',
    }).then(response => {
      response.json().then(userInfo => {
        setUserInfo(userInfo);
      });
    });
  }, []);

  function logout() {
    fetch('http://localhost:4000/logout', {
      credentials: 'include',
      method: 'POST',
    });
    setUserInfo(null);
  }

  const username = userInfo?.username;

  return (
    <header>
      <Link to="/" className="logo">SimpleBlogCCP</Link>
      <nav>
        {username && (
          <>
            <Link className="header-titles" to="/create">Create new post</Link>
            <a className="logout" onClick={logout}>Logout ({username})</a>
          </>
        )}
        {!username && (
          <>
            <Link className="header-titles" to="/login">Login</Link>
            <Link className="header-titles" to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}