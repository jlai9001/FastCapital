import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./investment-card.css";

export default function InvestmentCardsByBusinessId({ businessId }) {
  const [investments, setInvestments] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInvestments() {
      try {
        const res = await fetch(`http://localhost:8000/api/business_investments?business_id=${businessId}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Investments not found");
        const data = await res.json();
        setInvestments(data);
      } catch (err) {
        setError(err.message);
      }
    }

    if (businessId) {
      fetchInvestments();
    }
  }, [businessId]);

  if (error) return <h1>{error}</h1>;
  if (!investments) return <h1>Loading investments...</h1>;
  if (investments.length === 0) return <h1>No investments found for this business.</h1>;

  return (
    <div className="investment-list">
      {investments.map((investment) => (
        <div key={investment.id} className="investment-card">
          <h3>Shares Available: {investment.shares_available}</h3>
          <h3>Price per Share: ${investment.price_per_share}</h3>
          <h3>Minimum Investment: {investment.min_investment} shares</h3>
          <h3>Investment Starts: {new Date(investment.start_date).toLocaleDateString()}</h3>
          <h3>Investment Ends: {new Date(investment.expiration_date).toLocaleDateString()}</h3>
          <button onClick={() => navigate(`/investment-details/${investment.id}`)}>View Details</button>
        </div>
      ))}
    </div>
  );
}
