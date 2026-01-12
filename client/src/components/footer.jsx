import React from "react";
import "./footer.css";
import logo from "../assets/logo.svg";
import {NavLink} from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">

        {/* Column 1: Logo */}
        <div className="footer__section footer__logo-section">
          <a href="/" className="footer__logo">
            <img src={logo} alt="Fast Capital logo" className="nav-logo-image" />
            Fast Capital
          </a>
        </div>

        {/* Column 2: Links */}
        <div className="links-section">
          <NavLink
              className="nav-link"
              to='/terms'>
              Terms
          </NavLink>

          <NavLink
              className="nav-link"
              to='/about'>
              About
          </NavLink>

          <NavLink
              className="nav-link"
              to='/contact'>
              Contact
          </NavLink>

        </div>


        {/* Column 4: Copyright */}
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
