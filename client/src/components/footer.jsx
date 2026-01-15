import React from "react";
import "./footer.css";
import logo from "../assets/logo.svg";
import { NavLink, useLocation } from "react-router-dom";

const Footer = () => {
  const location = useLocation();

  const handleFooterClick = (to) => {
    if (location.pathname === to) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "auto", // change to "smooth" if desired
      });
    }
  };

  return (
    <footer className="footer">
      <div className="footer__container">

        {/* Column 1: Logo */}
        <div className="footer__section footer__logo-section">
          <NavLink
            to="/"
            className="footer-logo"
            onClick={() => handleFooterClick("/")}
          >
            <img
              src={logo}
              alt="Fast Capital logo"
              className="nav-logo-image"
            />
            Fast Capital
          </NavLink>
        </div>

        {/* Column 2: Links */}
        <div className="links-section">
          <NavLink
            className="footer-link"
            to="/terms"
            onClick={() => handleFooterClick("/terms")}
          >
            Terms
          </NavLink>

          <NavLink
            className="footer-link"
            to="/about"
            onClick={() => handleFooterClick("/about")}
          >
            About
          </NavLink>

          <NavLink
            className="footer-link"
            to="/contact"
            onClick={() => handleFooterClick("/contact")}
          >
            Contact
          </NavLink>
        </div>

        {/* Column 3: Copyright */}
        <div className="footer__section footer__copyright-section">
          <p className="footer__copyright_msg">
            © {new Date().getFullYear()} Fast Capital. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
