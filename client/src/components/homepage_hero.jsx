import React from 'react'
import "./homepage_hero.css";
import { useNavigate } from 'react-router-dom'
import investmentLogo from '../assets/investment_logo.png';

export default function HomePageHero(){

    const navigate = useNavigate();
    // set states

        const handleViewAllClick = () => {
        navigate('/all-investments');
    };

    // display elements
    return (
        <section className="homepage-hero">
        <div className="hero-text">
            <h1>Welcome to FastCapital</h1>
            <p className="hero-subtext">Invest in local businesses. Empower communities. Grow your wealth.</p>
            <button onClick={handleViewAllClick} className="browse-opp-button">Browse Opportunities</button>
        </div>
        </section>
    )
}
