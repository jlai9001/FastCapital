import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./investment-cards-by-businessID.css";
import { base_url } from "../api";

export default function InvestmentCardsByBusinessId({ businessId }) {
  const [investments, setInvestments] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchInvestments() {
      try {
        const res = await fetch(`${base_url}/api/business_investments?business_id=${businessId}`, {
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
    <div>
      {investments.map((investment) => {
        const totalSharesPurchased = Array.isArray(investment.purchases)
        ? investment.purchases.reduce((sum, p) => sum + p.shares_purchased, 0)
        : 0;

        const totalShares = totalSharesPurchased + investment.shares_available;

        const percentSold = totalShares > 0
          ? (totalSharesPurchased / totalShares) * 100
        : 0;
        const uniqueInvestorIds = new Set(
          investment.purchases?.map((p) => p.user_id)
        );
        const investorCount = uniqueInvestorIds.size;

        return (
          <div key={investment.id} className="business-investment-card">
            <div className="custom-grid">
        {/* Row 1: Labels */}
        <div className="cell investment-card-label">Shares Available</div>
        <div className="cell investment-card-label">Min. Investment</div>
        <div className="cell investment-card-label">Price/Share</div>
        <div className="cell investment-card-label">Offer Expiry</div>
        <div className="cell investment-card-label">Current Investors</div>
        <div className="column-6">
        <button className="view-details-button" onClick={() => navigate(`/investment-details/${investment.id}`)}>View Details</button>
        </div>

        {/* Row 2: Values */}
        <div className="cell investment-card-value">{investment.shares_available}</div>
        <div className="cell investment-card-value">{investment.min_investment} shares</div>
        <div className="cell investment-card-value">${investment.price_per_share}</div>
        <div className="cell investment-card-value">
          {new Date(investment.expiration_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
        <div className="cell investment-card-value">{investorCount}</div>

        {/* Row 3: Crowdfunded */}
        <div className="span-cell funded">Funded</div>

        {/* Row 4: Progress Bar */}
        <div className="span-cell progress-bar-row">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${percentSold}%` }}></div>
                    </div>
                    <p className="funded-percentage">{percentSold.toFixed(0)}%</p>
                  </div>
                </div>
              </div>
        );
      })}
    </div>
  );
}
