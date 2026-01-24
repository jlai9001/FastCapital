import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./signup.css";
import coin from "../assets/coin.svg";
import { useUser } from "../context/user-provider.jsx";
import { base_url } from "../api";
import { useUIBlocker } from "../context/ui-blocker-provider.jsx";


// check if email exists
async function checkEmailExists(email) {
  try {
    const res = await fetch(
      `${base_url}/api/users/email-exists?email=${encodeURIComponent(email)}`,
      { credentials: "include" }
    );
    const data = await res.json();
    return Boolean(data?.exists);
  } catch {
    return false; // fail open
  }
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}


function saveAccessToken(token) {
  if (!token) return;
  localStorage.setItem("access_token", token);
}

// Backend uses Pydantic EmailStr => requires a dot in the domain (name@domain.com)
function isValidEmailForBackend(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function SignupForm() {
  const navigate = useNavigate();
  const { refreshUser } = useUser();
  const { withUIBlock } = useUIBlocker();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });



  // Keep a ref of latest email to prevent stale async overwrite on blur
  const latestEmailRef = useRef("");
  useEffect(() => {
    latestEmailRef.current = formData.email;
  }, [formData.email]);

  // Field reminders/errors
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    server: "",
  });

  // Prevent double submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keep your existing popup style for password mismatch
  const [showPasswordError, setShowPasswordError] = useState(false);

  const validateField = (field, value, all = formData) => {
    const v = String(value ?? "");

    if (field === "name") {
      if (!v.trim()) return "Full name is required.";
      return "";
    }

    if (field === "email") {
      if (!v.trim()) return "Email is required.";
      if (!isValidEmailForBackend(v)) return "Use a valid email like name@domain.com";
      return "";
    }

    if (field === "password") {
      if (!v) return "Password is required.";
      if (v.length < 6) return "Password should be at least 6 characters.";
      return "";
    }

    if (field === "confirmPassword") {
      if (!v) return "Please confirm your password.";
      if (v !== (all.password || "")) return "Passwords do not match.";
      return "";
    }

    return "";
  };
  const canSubmit =
    !isSubmitting &&
    !validateField("name", formData.name, formData) &&
    !validateField("email", formData.email, formData) &&
    !validateField("password", formData.password, formData) &&
    !validateField("confirmPassword", formData.confirmPassword, formData) &&
    !errors.email; // disables if blur-check set "already registered"

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = { ...prev, [name]: value };

      setErrors((p) => {
        const updated = { ...p, server: "" };

        // clear email uniqueness error while typing
        if (name === "email") {
          updated.email = "";
        } else {
          updated[name] = validateField(name, value, next);
        }

        // re-check confirm password if password changes
        if (name === "password" && next.confirmPassword) {
          updated.confirmPassword = validateField(
            "confirmPassword",
            next.confirmPassword,
            next
          );
        }

        return updated;
      });

      return next;
    });

    if (showPasswordError) setShowPasswordError(false);
  };

  const handleBlur = async (e) => {
    const { name, value } = e.target;

    // run normal validation first
    const msg = validateField(name, value, formData);
    if (msg) {
      setErrors((p) => ({ ...p, [name]: msg }));
      return;
    }

    // email uniqueness check (ONLY on blur)
    if (name === "email" && isValidEmailForBackend(value)) {
      const emailAtBlur = value;

      const exists = await checkEmailExists(emailAtBlur);

      // prevent stale async overwrite (use ref, not formData)
      if (latestEmailRef.current !== emailAtBlur) return;

      if (exists) {
        setErrors((p) => ({
          ...p,
          email: "That email is already registered.",
        }));
        return;
      }
    }

    // clear error if all good
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validate all fields before API call
    const nextErrors = {
      name: validateField("name", formData.name, formData),
      email: validateField("email", formData.email, formData),
      password: validateField("password", formData.password, formData),
      confirmPassword: validateField("confirmPassword", formData.confirmPassword, formData),
      server: "",
    };

    setErrors(nextErrors);

    const hasAnyError = Object.values(nextErrors).some(Boolean);
    if (hasAnyError) {
      if (nextErrors.confirmPassword === "Passwords do not match.") {
        setShowPasswordError(true);
      }
      return;
    }

    const { confirmPassword, ...submitData } = formData;

    setIsSubmitting(true);
    try {
      await withUIBlock(async () => {
        const res = await fetch(`${base_url}/api/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
          credentials: "include",
        });

        const data = await safeJson(res);


        if (res.ok && data?.success) {
          // AUTO-LOGIN: store JWT fallback exactly like login.jsx does
          saveAccessToken(data.access_token);

          // pull /api/me and populate user context
          await refreshUser();

          // redirect like a normal login
          navigate("/portfolio", { replace: true });
          return;
        }

        if (res.status === 409) {
          setErrors((p) => ({
            ...p,
            server: "That email is already registered. Try logging in instead.",
          }));
          return;
        }

        if (res.status === 422) {
          setErrors((p) => ({
            ...p,
            server: "Please enter a valid email like name@domain.com.",
          }));
          return;
        }

        const backendDetail =
          (typeof data?.detail === "string" && data.detail) ||
          (Array.isArray(data?.detail) && data.detail[0]?.msg) ||
          data?.message;

        setErrors((p) => ({
          ...p,
          server: backendDetail || "Signup failed. Please try again.",
        }));
      }, "Creating account…");
    } catch {
      setErrors((p) => ({ ...p, server: "Network error. Please try again." }));
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
          {errors.password && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {errors.password}
            </div>
          )}

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
            disabled={isSubmitting}
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
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button className="signup-button" type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creating..." : "Sign Up"}
            </button>


          </div>

          {errors.server && (
            <p style={{ marginTop: 12, textAlign: "center" }}>{errors.server}</p>
          )}

          <p className="no-account">
            Already have an account?{" "}
            <span className="log-in" onClick={() => navigate("/login")}>
              Log in
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignupForm;
