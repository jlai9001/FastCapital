import React, { useState } from "react";
// CRITICAL: Import from 'react-router-dom' for web projects
import { NavLink, useNavigate} from "react-router-dom";
import './Nav.css';
import { useUser } from "../context/user-provider";

export default function Nav() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, refreshUser } = useUser();
    const navigate = useNavigate();

    const closeMobileMenu = () => {
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        await fetch('http://localhost:8000/api/logout', {
            method: 'POST',
            credentials: 'include',
        });

        await refreshUser();
        navigate('/login');
    };

    return (
        <header> {/* Using <header> tag is semantically good for main navigation */}
            <nav className="navbar">
                <NavLink className="nav-link logo" to="/" onClick={closeMobileMenu}>
                    Fast Capital
                </NavLink>

                {/* Desktop Navigation Links */}
                <div className="nav-center desktop-only">
                    {user && (
                        <>
                            <NavLink
                                className="nav-link"
                                id="portfolio"
                                to="/portfolio"
                                style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: 'bold' } : {}}
                            >
                                Portfolio
                            </NavLink>
                            <NavLink
                                className="nav-link"
                                id="business-profile"
                                to="/business-profile"
                                style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: 'bold' } : {}}
                            >
                                Business Profile
                            </NavLink>
                        </>
                    )}
                    <NavLink
                        className="nav-link"
                        id="all-investments"
                        to="/all-investments"
                        style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: 'bold' } : {}}
                    >
                        All Investments
                    </NavLink>
                </div>

                {user ? (
                    <button
                        className="nav-link desktop-only"
                        id="logout"
                        onClick={handleLogout}
                        >
                        Logout
                        </button>
                ) : (
                    <NavLink
                        className="nav-link desktop-only"
                        id="login"
                        to="/login"
                        style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: 'bold' } : {}}
                    >
                        Login
                    </NavLink>
                )}

                {/* Hamburger Icon for Mobile */}
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
                    <NavLink className="nav-link" to="/portfolio" onClick={closeMobileMenu}>
                        Portfolio
                    </NavLink>
                    <NavLink className="nav-link" to="/business-profile" onClick={closeMobileMenu}>
                        Business Profile
                    </NavLink>
                    </>
                    )}
                    <NavLink className="nav-link" to="/all-investments" onClick={closeMobileMenu}>
                        All Investments
                    </NavLink>
                    {user ? (
                        <button
                            className="nav-link"
                            id="logout-mobile"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    ) : (
                    <NavLink className="nav-link" to="/login" onClick={closeMobileMenu}>
                        Login
                    </NavLink>
            )}
                </div>
            )}
        </header>
    );
}
