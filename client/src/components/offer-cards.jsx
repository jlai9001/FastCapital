import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOffers, getBusinesses } from "../hooks/getData";
import "./offer-cards.css";


export default function OfferCards() {
    const [error, setError] = useState(null);
    const [offers, setOffers] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async function fetchData() {
            const offersResult = await getOffers();
            if (offersResult instanceof Error) {
                setError("Offers Not Found");
                return;
            }
            setOffers(offersResult);

            const businessesResult = await getBusinesses();
            if (businessesResult instanceof Error) {
                setError("Businesses Not Found");
                return;
            }
            setBusinesses(businessesResult);
        })();
    }, []);

    if (error) return <h1>{error}</h1>;
    if (!offers.length || !businesses.length) return <h1>Loading...</h1>;

    const handleViewDetailsClick = (offerId) => {
        navigate(`/offer/${offerId}`); // Replace with actual route to Offer Detail page
    };

return (
    <div className="offer-list-container">
      <ul>
        {offers.map((offer) => {
            const business = businesses.find(b => b.id === offer.business_id);
            if (!business) return null;

            // Placeholder calculations
            const shares_available = offer.shares_available - offer.shares_sold;

            return (
                <li key={offer.id} className="offer-card">
                    <h3>Business Name: {business.name}</h3>
                    <h3>Location: {business.city}, {business.state}</h3>
                    <div className="details">
                    <h3>Website: {business.website}</h3>
                    <h3>Shares Available: {offer.shares_available}</h3>
                    <h3>Price per share: {offer.price_per_share}</h3>
                    <h3>Minimum shares for investment: {offer.min_investment}</h3>
                    <h3>Offer expires on: {offer.expiration_date}</h3>
                    </div>
                    <div className="button-container">
                        <button onClick={() => handleViewDetailsClick(offer.id)}
                         className="view-details-button">View Details</button>
                    </div>
                </li>
            );
        })}
      </ul>
  </div>
  );
}
