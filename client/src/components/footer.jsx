import React from "react";
import "./footer.css";
import logo from "../assets/logo.svg";

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
        <div className="footer__section">
          <h2 className="footer__heading">Links</h2>
          <ul className="footer__list">
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Column 3: Follow Us */}
        <div className="footer__section">
          <h2 className="footer__heading">Follow Us</h2>
          <div className="footer__socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>

        {/* Column 4: Copyright */}
        <div className="footer__section footer__copyright-section">
          <p className="footer__copyright">
            © {new Date().getFullYear()} Fast Capital. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
