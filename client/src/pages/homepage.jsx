import React, { useState, useEffect } from 'react'
import HomePageHero from '../components/homepage_hero'
import OfferCards from '../components/offer-cards'

export default function Homepage(){
    const [featuredInvestments, setFeaturedInvestments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect (() => {
        const fetchFeaturedInvestments = async () => {
            try {
                const result = await fetch('http://localhost:8000/api/investment')
                if(!result.ok) throw new Error("Failed to fetch offers")

                const data = await result.json();
                const featured = data.filter((offer) => offer.featured);
                setFeaturedInvestments(featured);
            } catch (error) {
                console.error(error);
                setError("Could not load featured investments")
            } finally {
                setLoading(false)
            }
        };
        fetchFeaturedInvestments();
    }, []);

    return(
        <>
            <HomePageHero />
            <section className='featured-investments'>
                <h2>Featured Investments</h2>
                {loading && <p>Loading featured investments...</p>}
                {error && <p>{error}</p>}
                {featuredInvestments.length > 0 && (
                <ul>
                    {featuredInvestments.map((offer) => (
                    <li key={offer.id}>
                        <OfferCards offer={offer} />
                    </li>
                    ))}
                </ul>
                )}
            </section>
        </>
    )
}
