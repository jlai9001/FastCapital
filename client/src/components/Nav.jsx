import React, { useState } from "react";
import { NavLink, useNavigate} from "react-router-dom";
import './Nav.css';
import { useUser } from "../context/user-provider";
import logo from "../assets/logo.svg"
import { base_url } from "../api";

export default function Nav() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, refreshUser } = useUser();
    const navigate = useNavigate();

    const closeMobileMenu = () => {
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        await fetch(`${base_url}/api/logout`, {
            method: 'POST',
            credentials: 'include',
        });

        await refreshUser();
        navigate('/login');
    };

    return (
        <header> {/* Using <header> tag is semantically good for main navigation */}

            <nav className="navbar">
            {/* LEFT */}
            <div className="nav-left">
                <NavLink className="nav-link logo" to="/" onClick={closeMobileMenu}>
                <img src={logo} alt="Logo" className="nav-logo-image" />
                Fast Capital
                </NavLink>
            </div>

            {/* CENTER */}
            <div className="nav-center">
                {user && (
                <>
                    <NavLink className="nav-link" to="/all-investments">
                    All Investments
                    </NavLink>
                    <NavLink className="nav-link" to="/portfolio">
                    Portfolio
                    </NavLink>
                    <NavLink className="nav-link" to="/business-profile">
                    Business Profile
                    </NavLink>
                </>
                )}
            </div>

            {/* RIGHT */}
            <div className="nav-right desktop-only">
                {user ? (
                <button className="nav-link" id="logout" onClick={handleLogout}>
                    Logout
                </button>
                ) : (
                <div className="nav-buttons">
                    <NavLink className="nav-link" to="/signup">Sign Up</NavLink>
                    <NavLink className="nav-link" to="/login">Login</NavLink>
                </div>
                )}
            </div>

            {/* Hamburger */}
            <button
                className="hamburger mobile-only"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle menu"
            >
                ☰
            </button>
            </nav>

            {/* Mobile Menu (conditionally rendered) */}
            {menuOpen && (
                <div className="mobile-menu mobile-only">
                    {user && (
                        <>
                            <NavLink className="nav-link" to="/all-investments" onClick={closeMobileMenu}>
                                All Investments
                            </NavLink>
                            <NavLink className="nav-link" to="/portfolio" onClick={closeMobileMenu}>
                                Portfolio
                            </NavLink>
                            <NavLink className="nav-link" to="/business-profile" onClick={closeMobileMenu}>
                                Business Profile
                            </NavLink>
                        </>
                    )}
                    {user ? (
                        <button
                            className="nav-link mobile-only"
                            id="logout"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    ) : (
                    <div>
                    <NavLink
                        className="mobile-nav-link"
                        id="signup"
                        to="/signup"
                        onClick={closeMobileMenu}>
                        Sign Up
                    </NavLink>
                    <NavLink className="mobile-nav-link"
                    to="/login"
                    id="login"
                    onClick={closeMobileMenu}
                    >
                        Login
                    </NavLink>
                    </div>
            )}
                </div>
            )}
        </header>
    );
}
