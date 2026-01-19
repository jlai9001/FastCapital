import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./investment-cards-by-businessID.css";
import { base_url } from "../api";

export default function InvestmentCardsByBusinessId({ businessId }) {
  const [investments, setInvestments] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


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
  if (investments.length === 0)
    return (
      <div className="no-investment-text">
        Create an offer so that potential investors know what you're looking for.
      </div>
    );

    return (
    <div className="business-investment-list">
      {investments.map((investment) => {

        const purchases = Array.isArray(investment.purchases) ? investment.purchases : [];

        // ✅ investorCount = number of UNIQUE users who purchased
        const investorCount = new Set(purchases.map((p) => p.user_id).filter(Boolean)).size;


        const sharesSold = purchases.reduce(
          (sum, p) => sum + (Number(p.shares_purchased) || 0),
          0
        );

        const totalSharesIssued = sharesSold + (Number(investment.shares_available) || 0);

        const percentSoldRaw =
          totalSharesIssued > 0 ? (sharesSold / totalSharesIssued) * 100 : 0;

        const percentSold = Math.max(0, Math.min(100, percentSoldRaw));



        return (
          <div key={investment.id} className="business-investment-card">
            {isMobile ? (
              <div className="investment-mobile-card">
                <div className="investment-mobile-top">
                  <div className="investment-mobile-title">Investment Offer</div>
                  <button
                    className="view-details-button"
                    onClick={() => navigate(`/investment-details/${investment.id}`)}
                  >
                    Details
                  </button>
                </div>

                <div className="investment-mobile-stats">
                  <div className="stat-row">
                    <span className="stat-label">Shares Available</span>
                    <span className="stat-value">{investment.shares_available}</span>
                  </div>

                <div className="stat-row">
                  <span className="stat-label">Min. Investment</span>
                  <span className="stat-value">{investment.min_investment} shares</span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Price/Share</span>
                  <span className="stat-value">${investment.price_per_share}</span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Offer Expiry</span>
                  <span className="stat-value">
                    {new Date(investment.expiration_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Current Investors</span>
                  <span className="stat-value">{investorCount}</span>
                </div>
              </div>

              <div className="investment-mobile-funded">
                <div className="funded-row">
                  <span className="funded-label">Funded</span>
                  <span className="funded-percentage">{percentSold.toFixed(0)}%</span>
                </div>

                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentSold}%` }} />
                </div>
              </div>
            </div>
            ) : (
              <div className="custom-grid">
                {/* Row 1: Labels */}
                <div className="cell investment-card-label">Shares Available</div>
                <div className="cell investment-card-label">Min. Investment</div>
                <div className="cell investment-card-label">Price/Share</div>
                <div className="cell investment-card-label">Offer Expiry</div>
                <div className="cell investment-card-label">Current Investors</div>
                <div className="column-6">
                  <button
                    className="view-details-button"
                    onClick={() => navigate(`/investment-details/${investment.id}`)}
                  >
                    Details
                  </button>
                </div>

                {/* Row 2: Values */}
                <div className="cell investment-card-value">{investment.shares_available}</div>
                <div className="cell investment-card-value">{investment.min_investment} shares</div>
                <div className="cell investment-card-value">${investment.price_per_share}</div>
                <div className="cell investment-card-value">
                  {new Date(investment.expiration_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
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
            )}
          </div>
        );
      })}
    </div>
  );

}
