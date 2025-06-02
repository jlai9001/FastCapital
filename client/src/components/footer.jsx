import React from "react";
import "./Footer.css"; // Assuming this is in the same folder or adjust the path

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Logo / App Name */}
        <div className="footer__section">
          <h1 className="footer__title">Fast Capital</h1>
          <p className="footer__copyright">
            © {new Date().getFullYear()} Fast Capital. All rights reserved.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="footer__section">
          <h2 className="footer__heading">Links</h2>
          <ul className="footer__list">
            <li><a href="/about">About</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/privacy">Privacy Policy</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="footer__section">
          <h2 className="footer__heading">Follow Us</h2>
          <div className="footer__socials">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
