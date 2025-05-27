import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBusinesses } from "../hooks/getData";
import "./offer-cards.css";

export default function OfferCard({ offer }) {
  const [business, setBusiness] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    (async function fetchBusiness() {
      try {
        const businessesResult = await getBusinesses();
        if (businessesResult instanceof Error) {
          throw new Error("Businesses Not Found");
        }

        const matched = businessesResult.find(b => b.id === offer.business_id);
        if (!matched) {
          throw new Error("Matching business not found");
        }

        setBusiness(matched);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [offer.business_id]);

  if (error) return <h1>{error}</h1>;
  if (!business) return <h1>Loading...</h1>;

  const handleViewDetailsClick = () => {
    navigate(`/offer/${offer.id}`);
  };

  return (
    <div className={`offer-card ${offer.featured ? 'featured' : ''}`}>
      <h3>Business Name: {business.name}</h3>
      <h3>Location: {business.city}, {business.state}</h3>
      <div className="details">
        <h3>Website: {business.website}</h3>
        <h3>Shares Available: {offer.shares_available}</h3>
        <h3>Price per Share: ${offer.price_per_share}</h3>
        <h3>Minimum Investment: {offer.min_investment} shares</h3>
        <h3>Offer starts on: {new Date(offer.start_date).toLocaleDateString()}</h3>
        <h3>Offer expires on: {new Date(offer.expiration_date).toLocaleDateString()}</h3>
      </div>
      <div className="button-container">
        <button onClick={handleViewDetailsClick} className="view-details-button">
          View Details
        </button>
      </div>
    </div>
  );
}
