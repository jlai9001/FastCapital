import { useState } from "react";
import { useNavigate } from "react-router-dom";
import './signup.css';
import { useUser } from "../context/user-provider.jsx";

function SignupForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
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
      <h1 className="signup-title">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <div className="button-group">
          <button type="button" onClick={() => navigate("/")}>Cancel</button>
          <button type="submit">
            Sign Up
          </button>
          </div>

          {message && <p>{message}</p>}

          <p className="login-link">Already have an account? <a href="/login">Log in</a>
      </p>
        </form>
        </div>
  );
}

export default SignupForm;
