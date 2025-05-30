import { useNavigate } from "react-router-dom";
import FinancialDashboard from "../components/financials_table";
import InvestmentCardsByBusinessId from "../components/investment-cards-by-businessID.jsx";
import { useBusinessForUser } from "../hooks/getData.jsx";
import "./business-profile.css";

export default function BusinessProfile() {
    const navigate = useNavigate();
    const { business, loading, error } = useBusinessForUser();

    if (loading) return <h1> Loading... </h1>
    if (error) return <h1> {error.message} </h1>
    if (!business) return <h1>No business found.</h1>

    return (
        <div className="business-profile-container">
            <h1 className="business-name">{business.name}</h1>
            <div className="business-info">
                <div className="business-image-container">
            <img
            src={business.image_url || "https://via.placeholder.com/150"}
            alt={business.name}
            className="business-image"
            />
            </div>
          <div className="business-details">
          <h3>{business.city}, {business.state}</h3>
          <h3><a href={business.website_url} target="_blank" rel="noopener noreferrer">{business.website_url}</a></h3>
          </div>
          </div>

          <div className="financial-dashboard-container">
          {business?.id && <FinancialDashboard businessId={business.id} />}
        </div>
        <div className="business-investment-container">
        <h2>Investment Offers</h2>
        {<InvestmentCardsByBusinessId businessId={business.id} />}
        <button type="button" onClick={() => navigate("/add-investment")}>Add Investment Offer</button>
        </div>
        </div>
      );
    }
