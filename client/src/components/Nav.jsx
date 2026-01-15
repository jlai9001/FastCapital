import React, { useState, useEffect } from "react";
import {
  Link,
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./Nav.css";
import { useUser } from "../context/user-provider";
import logo from "../assets/logo.svg";
import { base_url } from "../api";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, refreshUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const closeMobileMenu = () => {
    setMenuOpen(false);
  };

    useEffect(() => {
    if (!menuOpen) return;

    const handleScroll = () => {
      setMenuOpen(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  // Handles BOTH:
  // - same-page clicks → scroll to top
  // - mobile menu close
  const handleNavClick = (to) => {
    closeMobileMenu();

    if (location.pathname === to) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto", // change to "smooth" if desired
      });
    }
  };

  const handleLogout = async () => {
    await fetch(`${base_url}/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    await refreshUser();
    navigate("/login");
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

        {/* CENTER */}
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

        {/* RIGHT (DESKTOP) */}
        <div className="nav-right desktop-only">
          {user ? (
            <button
              className="nav-link"
              id="logout"
              onClick={handleLogout}
            >
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

        {/* HAMBURGER */}
        <button
          className="hamburger mobile-only"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu mobile-only">
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

          {user ? (
            <button
              className="nav-link"
              id="logout"
              onClick={handleLogout}
            >
              Logout
            </button>
          ) : (
            <div>
              <NavLink
                className="mobile-nav-link"
                id="login"
                to="/login"
                onClick={() => handleNavClick("/login")}
              >
                Login
              </NavLink>

              <NavLink
                className="mobile-nav-link"
                id="signup"
                to="/signup"
                onClick={() => handleNavClick("/signup")}
              >
                Sign Up
              </NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
