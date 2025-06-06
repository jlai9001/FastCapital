import './login.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/user-provider.jsx';
import { base_url } from '../api'

function Error_Message() {
  return (
    <div className="Error_Message">INVALID EMAIL OR PASSWORD</div>
  );
}

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  const [loading, setLoading] = useState(false)

  const { refreshUser } = useUser();   // useUser hook inside main Login component
  const navigate = useNavigate();


    const LoginClick = async () => {
    if (!email || !password) {
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
        const response = await fetch(`${base_url}/api/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            console.error("Login failed:", data.detail || "Unknown error");
            setShowError(true);
            return;
        }

        console.log("Login success!");
        await refreshUser();
        navigate("/portfolio");

    } catch (error) {
        console.error("Login error:", error);
        setShowError(true);
    } finally {
        setLoading(false);
    }
};


  const SignUpClick = () => {
    navigate("/signup");
  };

  const ForgetPasswordClick = () => {
    alert("Can't Change Password - Developer 404"); //future ticket
  };

    return(
        <div className="login_container">
          <div className ="login-form">
            <div className= "login-title">Login </div>
            <div className= "login-subtitle">Enter your login credentials below. </div>
            {showError && <Error_Message />}
            <div className = "All_Fields_Container">
                <div className= "Input_Container">
                <div className = "field-label">Email</div>
                      <input className="input-field"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Your Email"
                      />
                <div className = "field-label">Password</div>
                      <input className="input-field"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter Your Password"
                      />

                      <button className="login-button" onClick={LoginClick}>Login</button>
                          <div className="bottom-field">
                            <div className="no-account-msg">
                                Don't have an account?
                                <span className="create-account-link" onClick={SignUpClick}>Create an Account</span>
                            </div>
                          </div>
                      </div>
                </div>
          </div>
        </div>
    )
}

export default Login;
