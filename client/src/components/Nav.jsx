import React, { useState } from "react";
// CRITICAL: Import from 'react-router-dom' for web projects
import { NavLink} from "react-router-dom";
import './Nav.css';

export default function Nav() {
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMobileMenu = () => {
        setMenuOpen(false);
    };

    return (
        <header> {/* Using <header> tag is semantically good for main navigation */}
            <nav className="navbar">
                <NavLink className="nav-link logo" to="/" onClick={closeMobileMenu}>
                    Fast Capital
                </NavLink>

                {/* Desktop Navigation Links */}
                <div className="nav-center desktop-only">
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
                        id="all-investments"
                        to="/all-investments"
                        style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: 'bold' } : {}}
                    >
                        All Investments
                    </NavLink>
                </div>
                    <NavLink
                        className="nav-link desktop-only"
                        id="login"
                        to="/login"
                        style={({ isActive }) => isActive ? { textDecoration: 'underline', fontWeight: 'bold' } : {}}
                    >
                        Login
                    </NavLink>

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
                    <NavLink className="nav-link" to="/feed" onClick={closeMobileMenu}>
                        Portfolio
                    </NavLink>
                    <NavLink className="nav-link" to="/my-recipes" onClick={closeMobileMenu}>
                        All Investments
                    </NavLink>
                    <NavLink className="nav-link" to="/my-recipes" onClick={closeMobileMenu}>
                        Login
                    </NavLink>
                </div>
            )}
        </header>
    );
}
