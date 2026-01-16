import { useNavigate } from "react-router-dom";
import "../components/investment-card.css";

import locationIcon from "../assets/location_icon.png";
import urlIcon from "../assets/link_vector.svg";
import placeholder from "../assets/business_placeholder.png";

export default function InvestmentCard({ investment, business }) {
  const navigate = useNavigate();

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
    <div className={`investment-card ${investment.featured ? "featured" : ""}`}>
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
      </div>

      <div className="business-name-text">{business.name}</div>

      <div className="city-state-text">
        <img className="pin-icon" src={locationIcon} />
        {business.city}, {business.state}
      </div>

      <a
        className="website-text"
        href={business.website_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img className="link-icon" src={urlIcon} />
        {business.website_url.replace(/^https?:\/\/(www\.)?/, "")}
      </a>

      <table className="investment-table">
        <tbody>
          <tr>
            <td className="label">Offer Expiry:</td>
            <td>
              {new Date(investment.expiration_date).toLocaleDateString()}
            </td>
          </tr>
          <tr>
            <td className="label">Shares Available:</td>
            <td>{investment.shares_available}</td>
          </tr>
          <tr>
            <td className="label">Min. Investment:</td>
            <td>{investment.min_investment} shares</td>
          </tr>
          <tr>
            <td className="label">Price per Share:</td>
            <td>${investment.price_per_share}</td>
          </tr>
        </tbody>
      </table>

      <div className="button-container">
        <button onClick={handleViewDetailsClick} className="view-details-button">
          Purchase
        </button>
      </div>
    </div>
  );
}
