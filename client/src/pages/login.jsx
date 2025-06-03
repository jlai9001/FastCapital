import './login.css';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/user-provider.jsx';

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
        const response = await fetch("http://localhost:8000/api/login", {
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
    alert("Can't Sign Up - Developer 404"); //nav to sign-up
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
                    </div>
                </div>
            <div className="Login_Button_Container">
                <button className="Login_Button" onClick={LoginClick}>Login</button>
                <div className="SecondRow">
                    <button className="Signup_Button" onClick={SignUpClick}>Sign Up</button>
                    <button className="Forget_Password_Button" onClick={ForgetPasswordClick}>Forget Password</button>
                </div>
            </div>
          </div>
        </div>
    )
}

export default Login;
