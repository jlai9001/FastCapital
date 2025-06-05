import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import HomePageHero from '../components/homepage_hero'
import InvestmentCard from '../components/investment-card'
import './homepage.css'

export default function Homepage(){
    const [featuredInvestments, setFeaturedInvestments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const navigate = useNavigate();


    useEffect (() => {
        const fetchFeaturedInvestments = async () => {
            try {
                const result = await fetch('http://localhost:8000/api/investment')
                if(!result.ok) throw new Error("Failed to fetch investments")

                const data = await result.json();
                const featured = data.filter((investment) => investment.featured);
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

    const handleViewAllClick = () => {
        navigate('/all-investments');
    };

    return(
        <>
            <HomePageHero />
            <section className='featured-investments'>
                <table style={{ width: "100%" }}>
                    <tbody>
                    <tr>
                        <td style={{ textAlign: "left" }}>
                        <h2>Featured Investments</h2>
                        </td>
                        <td style={{ textAlign: "right" }}>
                        <button onClick={handleViewAllClick} className='view-all-button'>
                            View All Investments
                        </button>
                        </td>
                    </tr>
                    </tbody>
                </table>
                {loading && <p>Loading featured investments...</p>}
                {error && <p>{error}</p>}
                {featuredInvestments.length > 0 && (
                <ul>
                    {featuredInvestments.map((investment) => (
                    <li key={investment.id}>
                        <InvestmentCard investment={investment} />
                    </li>
                    ))}
                </ul>
                )}
            </section>
        </>
    )
}
