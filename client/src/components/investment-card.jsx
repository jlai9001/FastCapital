import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBusinesses } from "../hooks/getData";
import "../components/investment-card.css";

export default function InvestmentCard({ investment }) {
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

        const matched = businessesResult.find(b => b.id === investment.business_id);
        if (!matched) {
          throw new Error("Matching business not found");
        }

        setBusiness(matched);
      } catch (err) {
        setError(err.message);
      }
    })();
  }, [investment.business_id]);

  if (error) return <h1>{error}</h1>;
  if (!business) return <h1>Loading...</h1>;

  const handleViewDetailsClick = () => {
    navigate(`/investment-details/${investment.id}`);
  };

  return (
    <div className={`investment-card ${investment.featured ? 'featured' : ''}`}>
      <h3>Business Name: {business.name}</h3>
      <h3>Location: {business.city}, {business.state}</h3>
      <div className="details">
        <h3>Website: {business.website}</h3>
        <h3>Shares Available: {investment.shares_available}</h3>
        <h3>Price per Share: ${investment.price_per_share}</h3>
        <h3>Minimum Investment: {investment.min_investment} shares</h3>
        <h3>Investment opportunity starts on: {new Date(investment.start_date).toLocaleDateString()}</h3>
        <h3>Investment opportunity ends on: {new Date(investment.expiration_date).toLocaleDateString()}</h3>
      </div>
      <div className="button-container">
        <button onClick={handleViewDetailsClick} className="view-details-button">
          View Details
        </button>
      </div>
    </div>
  );
}
