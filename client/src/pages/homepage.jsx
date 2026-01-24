import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import HomePageHero from '../components/homepage_hero'
import InvestmentCard from '../components/investment-card'
import './homepage.css'
import { base_url } from '../api'
import { getBusinesses } from '../hooks/getData'

export default function Homepage(){
    const [featuredInvestments, setFeaturedInvestments] = useState([])
    const [businesses, setBusinesses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

useEffect(() => {
  const fetchData = async () => {
    try {
      // 1️⃣ Fetch investments
      const investmentsRes = await fetch(`${base_url}/api/investment?active=true`, {
        credentials: "include",
      });
      if (!investmentsRes.ok) throw new Error("Failed to fetch investments");

      const investmentsData = await investmentsRes.json();


      // ✅ Only show featured investments that still have shares remaining
      const featured = investmentsData.filter((i) => {
        if (!i.featured) return false;

        const sharesLeft = Number(i?.shares_available);
        // If shares_available missing/non-numeric, keep it (don’t accidentally hide)
        if (!Number.isFinite(sharesLeft)) return true;

        return sharesLeft > 0;
      });

      setFeaturedInvestments(featured);




      // 2️⃣ Fetch businesses ONCE
      const businessesData = await getBusinesses();
      setBusinesses(businessesData);

    } catch (err) {
      console.error(err);
      setError("Could not load homepage data");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);




    return (
    <>
    {/* FULL-BLEED HERO */}
    <div className="full-bleed">
        <HomePageHero />
    </div>

    {/* CONSTRAINED CONTENT */}
    <main className="page-content">
        <section className="featured-investments">
        <div className="featured-header">
            <div className="featured-investments-text" >Featured Investments</div>
            <NavLink className="home-nav-link" to="/all-investments">
            View All
            </NavLink>
        </div>

        {loading && <p>Loading featured investments...</p>}
        {error && <p>{error}</p>}

        {/* ✅ No featured investments message */}
        {!loading && !error && featuredInvestments.length === 0 && (
          <p>No featured investments available right now.</p>
        )}

        {featuredInvestments.length > 0 && (
            <ul>
            {featuredInvestments.map((investment) => {
            const matchedBusiness = businesses.find(
                (b) => b.id === investment.business_id
            );

            return (
                <li key={investment.id}>
                <InvestmentCard
                    investment={investment}
                    business={matchedBusiness}
                />
                </li>
            );
            })}
            </ul>
        )}
        </section>
    </main>
    </>
    );

}
