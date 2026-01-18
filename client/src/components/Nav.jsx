import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import "./Nav.css";
import { useUser } from "../context/user-provider";
import logo from "../assets/logo.svg";
import { base_url } from "../api";

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function authHeader() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Nav() {
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  // Mobile dropdown UI state (client-only)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Handles same-page clicks → scroll to top
  const handleNavClick = (to) => {
    if (location.pathname === to) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto",
      });
    }
  };

  const go = (to) => {
    setMobileMenuOpen(false);
    if (location.pathname === to) {
      handleNavClick(to);
      return;
    }
    navigate(to);
  };

  // Close mobile menu when clicking/tapping outside it
  useEffect(() => {
    const onDocDown = (e) => {
      if (!mobileMenuRef.current) return;
      if (!mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("touchstart", onDocDown);

    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("touchstart", onDocDown);
    };
  }, []);

  // Close mobile menu on ANY scroll (prevents staying open while page moves)
  useEffect(() => {
    const onScroll = () => setMobileMenuOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change (prevents “stuck open”)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // If token/session is invalid or expired, revert UI back to "Login"
  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    let cancelled = false;

    const validateSession = async () => {
      try {
        const res = await fetch(`${base_url}/api/me`, {
          method: "GET",
          credentials: "include",
          headers: authHeader(),
        });

        if (!res.ok) {
          // Treat as expired/invalid token or session
          localStorage.removeItem("access_token");
          if (!cancelled) {
            await refreshUser();
            setMobileMenuOpen(false);
          }
        }
      } catch (e) {
        // Network errors: do NOT wipe token (avoid logging user out on bad connection)
        // If you *do* want to treat network as invalid, tell me and we can change this.
      }
    };

    validateSession();

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const validateSessionNow = async () => {
    const token = getAccessToken();
    if (!token) return false;

    try {
      const res = await fetch(`${base_url}/api/me`, {
        method: "GET",
        credentials: "include",
        headers: authHeader(),
      });

      if (!res.ok) {
        localStorage.removeItem("access_token");
        await refreshUser();
        return false;
      }

      return true;
    } catch (e) {
      // Network issue: assume valid so we don't block UI
      return true;
    }
  };


  const handleLogout = async () => {
    try {
      await fetch(`${base_url}/api/logout`, {
        method: "POST",
        credentials: "include",
        headers: authHeader(),
      });
    } finally {
      // Always clear client token (even if request fails)
      localStorage.removeItem("access_token");
      await refreshUser();
      setMobileMenuOpen(false);
      navigate("/login");
    }
  };

  return (
    <header>
      <nav className="navbar">
        {/* LEFT */}
        <div className="nav-left">
          <Link
            className="nav-link logo"
            to="/"
            onClick={() => handleNavClick("/")}
          >
            <img src={logo} alt="Logo" className="nav-logo-image" />
            Fast Capital
          </Link>
        </div>

        {/* CENTER (DESKTOP AUTH LINKS) */}
        <div className="nav-center">
          {user && (
            <>
              <NavLink
                className="nav-link"
                to="/all-investments"
                onClick={() => handleNavClick("/all-investments")}
              >
                All Investments
              </NavLink>

              <NavLink
                className="nav-link"
                to="/portfolio"
                onClick={() => handleNavClick("/portfolio")}
              >
                Portfolio
              </NavLink>

              <NavLink
                className="nav-link"
                to="/business-profile"
                onClick={() => handleNavClick("/business-profile")}
              >
                Business Profile
              </NavLink>
            </>
          )}
        </div>

        {/* RIGHT (DESKTOP ONLY) */}
        <div className="nav-right desktop-only">
          {user ? (
            <button className="nav-link" id="logout" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <div className="nav-buttons">
              <NavLink
                className="nav-link"
                to="/signup"
                onClick={() => handleNavClick("/signup")}
              >
                Sign Up
              </NavLink>

              <NavLink
                className="nav-link"
                to="/login"
                onClick={() => handleNavClick("/login")}
              >
                Login
              </NavLink>
            </div>
          )}
        </div>

        {/* RIGHT (MOBILE ONLY) */}
        <div className="nav-mobile-right mobile-only" ref={mobileMenuRef}>
          {user ? (
            <>
              {/* Trigger (text-only) */}
              <button
                type="button"
                className="mobile-toplink mobile-trigger"

                onClick={async () => {
                  if (mobileMenuOpen) {
                    setMobileMenuOpen(false);
                    return;
                  }
                  const ok = await validateSessionNow();
                  if (ok) setMobileMenuOpen(true);
                }}

                aria-haspopup="menu"
                aria-expanded={mobileMenuOpen}
              >
                Portfolio
              </button>

              {/* Dropdown */}
              {mobileMenuOpen && (
                <div className="mobile-dropdown" role="menu">
                  <button
                    type="button"
                    className="mobile-dropdown-item"
                    onClick={() => go("/portfolio")}
                    role="menuitem"
                  >
                    Portfolio
                  </button>

                  <button
                    type="button"
                    className="mobile-dropdown-item"
                    onClick={() => go("/business-profile")}
                    role="menuitem"
                  >
                    Business Profile
                  </button>

                  <button
                    type="button"
                    className="mobile-dropdown-item"
                    onClick={() => go("/all-investments")}
                    role="menuitem"
                  >
                    All Investments
                  </button>

                  <button
                    type="button"
                    className="mobile-dropdown-item"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <NavLink
              className="mobile-toplink"
              to="/login"
              onClick={() => handleNavClick("/login")}
            >
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
