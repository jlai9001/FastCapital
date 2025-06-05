import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBusinesses } from "../hooks/getData";
import "../components/investment-card.css";
import placeholder from "../assets/business_placeholder.png";

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

  const isValidImageUrl =
    typeof business.image_url === "string" &&
    business.image_url.trim() !== "" &&
    business.image_url !== "null" &&
    business.image_url !== "undefined";

  return (
    <div className={`investment-card ${investment.featured ? 'featured' : ''}`}>
  <div className="top-section">
    <div className="image-container">
      <img
        src={isValidImageUrl ? business.image_url : placeholder}
        alt={`${business.name} logo`}
        className="web-icon"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = placeholder;
        }}
      />
    </div>
    <div className="business-info">
      <h3>{business.name}</h3>
      <h3>{business.city}, {business.state}</h3>
      <h3 style={{ fontWeight: 'normal', fontSize: '0.85rem' }}>{business.website}</h3>
    </div>
  </div>

  <table className="investment-table">
    <tbody>
      <tr>
        <td className="label">Shares Available:</td>
        <td>{investment.shares_available}</td>
      </tr>
      <tr>
        <td className="label">Price per Share:</td>
        <td>${investment.price_per_share}</td>
      </tr>
      <tr>
        <td className="label">Minimum Investment:</td>
        <td>{investment.min_investment} shares</td>
      </tr>
      <tr>
        <td className="label">Starts On:</td>
        <td>{new Date(investment.start_date).toLocaleDateString()}</td>
      </tr>
      <tr>
        <td className="label">Ends On:</td>
        <td>{new Date(investment.expiration_date).toLocaleDateString()}</td>
      </tr>
    </tbody>
  </table>

  <div className="button-container">
    <button onClick={handleViewDetailsClick} className="view-details-button">
      View Details
    </button>
  </div>
</div>
  );
}
