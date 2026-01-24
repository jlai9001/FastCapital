import './login.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/user-provider.jsx';
import { base_url } from '../api';

function Blank_Message() {
  return <div className="Error_Message">EMAIL AND PASSWORD REQUIRED</div>;
}

function Invalid_Message() {
  return <div className="Error_Message">INVALID CREDENTIALS</div>;
}

function Failed_Message() {
  return <div className="Error_Message">LOGIN FAILED, PLEASE TRY AGAIN.</div>;
}

function saveAccessToken(token) {
  if (!token) return;
  localStorage.setItem("access_token", token);
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorType, setErrorType] = useState(null); // 'empty_fields' | 'invalid' | 'login_failed' | null
  const [loading, setLoading] = useState(false);

  const { refreshUser } = useUser();
  const navigate = useNavigate();

  const LoginClick = async () => {
    if (loading) return; // ✅ hard guard

    if (!email || !password) {
      setErrorType('empty_fields');
      return;
    }

    setLoading(true);
    setErrorType(null);

    try {
      const response = await fetch(`${base_url}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await safeJson(response);

      if (!response.ok || !data?.success) {
        console.error("Login failed:", data?.detail || "Unknown error");
        setErrorType('invalid');
        return;
      }

      // ✅ store JWT if backend provided it (iOS fallback)
      saveAccessToken(data.access_token);

      await refreshUser();
      navigate("/portfolio", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      setErrorType('login_failed');
    } finally {
      setLoading(false);
    }
  };

  const SignUpClick = () => {
    navigate("/signup");
  };

  return (
    <div className="login_container">
      <div className="login-form">
        <div className="login-title">Login</div>
        <div className="login-subtitle">Enter your login credentials below.</div>

        {errorType === 'empty_fields' && <Blank_Message />}
        {errorType === 'invalid' && <Invalid_Message />}
        {errorType === 'login_failed' && <Failed_Message />}

        <div className="All_Fields_Container">
          <div className="Input_Container">
            <div className="field-label">Email</div>
            <input
              className="input-field"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Your Email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              inputMode="email"
              disabled={loading}
            />

            <div className="field-label">Password</div>
            <input
              className="input-field"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Your Password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              disabled={loading}
            />

            <button className="login-button" onClick={LoginClick} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="bottom-field">
              <div className="no-account-msg">
                Don't have an account?
                <span className="create-account-link" onClick={SignUpClick}>
                  Create an Account
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
