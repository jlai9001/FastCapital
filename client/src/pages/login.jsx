import './login.css'
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';

function Error_Message(){
    return (
        <div className= "Error_Message">Invalid Username or Password</div>
    )
}


function Login(){
    const [email,set_email] = useState('');
    const [password,set_password] = useState('');
    const [showError,set_showError] = useState(false);

    const navigate = useNavigate();

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
    alert("Can't Sign Up - Developer 404")
    };

    const ForgetPasswordClick = () => {
    alert("Can't Change Password - Developer 404")
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
