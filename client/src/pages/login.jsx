import './login.css'
import {useState} from 'react';
import { useNavigate } from 'react-router-dom';

function Error_Message(){
    return (
        <div className= "Error_Message">Invalid Username or Password</div>
    )
}


function Login(){
    const [username,set_username] = useState('');
    const [password,set_password] = useState('');
    const [showError,set_showError] = useState(false);

    const navigate = useNavigate();

    const LoginClick = () => {
    console.log("Login Click");
    console.log("username",username);
    console.log("password",password);

    /////////////////////////////////////////////////// validate login credentials
    // login success
    if (username == "user123" && password == "P@ssw0rd123!"){
        console.log("login success!");
        navigate('/');
    }else{
    // login failed
        console.log("login failed!");
        set_showError(true);
    }

    }

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
                    <div className = "Field_Title">Username:</div>
                    <div className = "Field_Title">Password:</div>
                </div>
                <div className= "Input_Container">
                        <input className="Input_Field"
                        type="text"
                        value={username}
                        onChange={(e) => set_username(e.target.value)}
                        placeholder="Enter Your Username"
                        />
                        <input className="Input_Field"
                        type="text"
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
