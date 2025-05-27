import React from 'react'
import "./homepage_hero.css";

import investmentLogo from '../assets/investment_logo.png';

export default function HomePageHero(){
    // set states

    // display elements
    return (
        <section className="homepage-hero">
        <div className="hero-text">
            <h1>FastCapital</h1>
            <p>Your trusted partner in investment solutions.</p>
        </div>
        <div className="hero-action">
            <button className="cta-button">Get Started</button>
        </div>
        </section>
    )
}
