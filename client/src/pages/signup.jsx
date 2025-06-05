import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './signup.css';
import coin from '../assets/coin.svg'
import { useUser } from "../context/user-provider.jsx";

function SignupForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
  });

  //const [message, setMessage] = useState("");
  const { refreshUser } = useUser();
  const [showPasswordError, setShowPasswordError] = useState(false);   // Jonathan


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Hide password error when user starts typing
    if (showPasswordError) {
      setShowPasswordError(false);
  }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // password match error by Jonathan
    if (formData.password !== formData.confirmPassword) {
      // setMessage("Passwords do not match.");
      setShowPasswordError(true);
      return;
    }

    const { confirmPassword, ...submitData } = formData;

    const res = await fetch("http://localhost:8000/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submitData),
      credentials: "include",
    });

    const data = await res.json();

    if (res.ok && data.success) {
      await refreshUser();
      setMessage("Signup successful!");
      navigate("/portfolio");
    } else {
      setMessage("Signup failed.");
    }
  };

  return (
    <div className="signup-container">
      <div className = "signup-form">
        <img className = "coin" src={coin}></img>
        <div className="signup-title">Get Started</div>
        <div className="signup-subtitle">Enter the information below to start investing today.</div>
          <form onSubmit={handleSubmit}>
          <div className = "field-label">Full Name</div>
            <input
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          <div className = "field-label">Email</div>
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          <div className = "field-label">Password</div>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          {/* password match error by Jonathan */}

          {showPasswordError && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              Passwords do not match
            </div>
          )}

          <div className = "field-label">Confirm Password</div>
            <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <div className="button-group">
            <button className="cancel-button" type="button" onClick={() => navigate("/")}>Cancel</button>
            <button className="signup-button" type="submit">
              Sign Up
            </button>
            </div>

          {/* replaced with default pop up instead by Jonathan */}
          {/* {message && <p>{message}</p>} */}

            <p className="no-account">Already have an account? <a className="log-in" href="/login">Log in</a>
        </p>
        </form>
        </div>
      </div>
  );
}

export default SignupForm;
