import './login.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/user-provider.jsx';

function Error_Message() {
  return (
    <div className="Error_Message">Invalid email or Password</div>
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

  const ForgetPasswordClick = () => {
    alert("Can't Change Password - Developer 404"); //future ticket
  };

    return(
        <div className="Login_Container">
            <div className= "Login_Title">Login </div>
            {showError && <Error_Message />}
            <div className = "All_Fields_Container">
                <div className= "Fields_Title_Container">
                    <div className = "Field_Title">Email:</div>
                    <div className = "Field_Title">Password:</div>
                </div>
                <div className= "Input_Container">
                        <input className="Input_Field"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter Your Email"
                        />
                        <input className="Input_Field"
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
                <button className="Signup_Button" onClick={() => navigate("/signup")}>Sign Up</button>
                    <button className="Forget_Password_Button" onClick={ForgetPasswordClick}>Forget Password</button>
                </div>
            </div>
        </div>
    )
}

export default Login;
