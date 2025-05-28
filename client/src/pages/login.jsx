import './login.css';
import { useState } from 'react';
import { data, useNavigate } from 'react-router-dom';
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

  const { refreshUser } = useUser();   // useUser hook inside main Login component
  const navigate = useNavigate();

  const LoginClick = async () => {
    console.log("Login Click");
    console.log("email", email);
    console.log("password", password);

    //this should check valid account & password

    //code here
    // fetch post with email and password
    const response = await fetch(`http://localhost:8000/api/login`, )
    // if true, nav

    //
    if (email === "user123" && password === "P@ssw0rd123!") {
      console.log("login success!");

      await refreshUser();     // refresh user context after login
      navigate('/');           // redirect to homepage with new context
    } else {
      console.log("login failed!");
      setShowError(true);
    }
  };
    const LoginClick = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/login", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "include",
              body: JSON.stringify({
                email: email,
                password: password,
              }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Login failed:", errorData.detail || "Unknown error");
                set_showError(true);
                return;
            }

            const data = await response.json();
            if (data.success) {
              console.log("Login success!");
              navigate("/portfolio");
            } else {
                console.error("Login failed: success flag false");
                set_showError(true);
            }
          } catch (error) {
            console.log("Login error:", error);
            set_showError(true);
          }
        };

  const SignUpClick = () => {
    alert("Can't Sign Up - Developer 404"); //nav to sign-up
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
                        onChange={(e) => set_email(e.target.value)}
                        placeholder="Enter Your Email"
                        />
                        <input className="Input_Field"
                        type="password"
                        value={password}
                        onChange={(e) => set_password(e.target.value)}
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
    )
}

export default Login;
