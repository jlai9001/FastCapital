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
      <span><img src={business.image_url}></img>
      <h3>Business Name: {business.name}</h3></span>
      <h3>Location: {business.city}, {business.state}</h3>
      <h3>{business.website}</h3><br/><br/>
      <table className="investment-table">
        <tbody>
          <tr>
            <td className="label">Shares Available:</td>
            <td className="spacer"></td>
            <td>{investment.shares_available}</td>
          </tr>
          <tr>
            <td className="label">Price per Share:</td>
            <td className="spacer"></td>
            <td>${investment.price_per_share}</td>
          </tr>
          <tr>
            <td className="label">Minimum Investment:</td>
            <td className="spacer"></td>
            <td>{investment.min_investment} shares</td>
          </tr>
          <tr>
            <td className="label">Starts On:</td>
            <td className="spacer"></td>
            <td>{new Date(investment.start_date).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="label">Ends On:</td>
            <td className="spacer"></td>
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
