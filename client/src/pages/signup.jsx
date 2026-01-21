import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import coin from "../assets/coin.svg";
import { useUser } from "../context/user-provider.jsx";
import { base_url } from "../api";

function SignupForm() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  // Field-level errors (for reminders)
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    server: "",
  });

  // Keep your existing "password mismatch" popup behavior
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Backend requires a real-looking email (EmailStr) => must include a dot in the domain
  const isValidEmailForBackend = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());

  const validateField = (name, value, allValues = formData) => {
    const v = String(value || "");

    if (name === "name") {
      if (!v.trim()) return "Full name is required.";
      return "";
    }

    if (name === "email") {
      if (!v.trim()) return "Email is required.";
      if (!isValidEmailForBackend(v)) return "Use a valid email like name@domain.com";
      return "";
    }

    if (name === "password") {
      if (!v) return "Password is required.";
      if (v.length < 6) return "Password should be at least 6 characters.";
      return "";
    }

    if (name === "confirmPassword") {
      if (!v) return "Please confirm your password.";
      if (v !== (allValues.password || "")) return "Passwords do not match.";
      return "";
    }

    return "";
  };

  const setOneError = (fieldName, msg) => {
    setErrors((prev) => ({ ...prev, [fieldName]: msg, server: "" }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      // Live-validate the field being edited
      const fieldMsg = validateField(name, value, next);
      setOneError(name, fieldMsg);

      // If confirmPassword depends on password, re-check it too
      if (name === "password" && next.confirmPassword) {
        const confirmMsg = validateField("confirmPassword", next.confirmPassword, next);
        setOneError("confirmPassword", confirmMsg);
      }

      return next;
    });

    // Hide your old mismatch popup when user starts typing again
    if (showPasswordError) setShowPasswordError(false);
    if (message) setMessage("");
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const msg = validateField(name, value, formData);
    setOneError(name, msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate all fields before hitting the API
    const nextErrors = {
      name: validateField("name", formData.name, formData),
      email: validateField("email", formData.email, formData),
      password: validateField("password", formData.password, formData),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword, formData),
      server: "",
    };

    setErrors(nextErrors);

    const hasAnyError = Object.values(nextErrors).some((v) => Boolean(v));
    if (hasAnyError) {
      // Keep your existing mismatch popup too (if that’s the error)
      if (nextErrors.confirmPassword === "Passwords do not match.") {
        setShowPasswordError(true);
      }
      return;
    }

    const { confirmPassword, ...submitData } = formData;

    try {
      const res = await fetch(`${base_url}/api/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
        credentials: "include",
      });

      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (res.ok && data?.success) {
        await refreshUser();
        navigate("/portfolio");
        return;
      }

      // Show helpful backend-based reminders
      if (res.status === 422) {
        setErrors((prev) => ({
          ...prev,
          server: "Signup failed: check your email format (example: name@domain.com).",
        }));
        return;
      }

      if (res.status === 409) {
        setErrors((prev) => ({
          ...prev,
          server: "That email is already registered. Try logging in instead.",
        }));
        return;
      }

      const backendDetail =
        (typeof data?.detail === "string" && data.detail) ||
        (Array.isArray(data?.detail) && data.detail[0]?.msg) ||
        data?.message;

      setErrors((prev) => ({
        ...prev,
        server: backendDetail || "Signup failed. Please try again.",
      }));
    } catch {
      setErrors((prev) => ({
        ...prev,
        server: "Network error. Please try again.",
      }));
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <img className="coin" src={coin} alt="coin" />
        <div className="signup-title">Get Started</div>
        <div className="signup-subtitle">
          Enter the information below to start investing today.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field-label">Full Name</div>
          <input
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoCapitalize="words"
            autoCorrect="off"
            spellCheck="false"
          />
          {errors.name && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {errors.name}
            </div>
          )}

          <div className="field-label">Email</div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
            inputMode="email"
          />
          {errors.email && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {errors.email}
            </div>
          )}

          <div className="field-label">Password</div>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
          {errors.password && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {errors.password}
            </div>
          )}

          {/* keep your existing mismatch popup (shows when submitting) */}
          {showPasswordError && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              Passwords do not match
            </div>
          )}

          <div className="field-label">Confirm Password</div>
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck="false"
          />
          {errors.confirmPassword && !showPasswordError && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {errors.confirmPassword}
            </div>
          )}

          <div className="button-group">
            <button
              className="cancel-button"
              type="button"
              onClick={() => navigate("/")}
            >
              Cancel
            </button>
            <button className="signup-button" type="submit">
              Sign Up
            </button>
          </div>

          {/* Server-level message */}
          {errors.server && (
            <p style={{ marginTop: 12, textAlign: "center" }}>{errors.server}</p>
          )}

          {/* (optional) keep this if you still want it */}
          {message && <p style={{ marginTop: 12, textAlign: "center" }}>{message}</p>}

          <p className="no-account">
            Already have an account?{" "}
            <a className="log-in" href="/login">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
