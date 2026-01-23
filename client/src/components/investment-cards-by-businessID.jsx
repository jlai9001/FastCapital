import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFundingPercent } from "../utils/investmentFunding";
import "./investment-cards-by-businessID.css";

export default function InvestmentCardsByBusinessId({ investments = [] }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);


if (!Array.isArray(investments) || investments.length === 0){
  return (
    <div className="no-investment-text">
      Create an offer so that potential investors know what you're looking for.
    </div>
  );
}

    return (
    <div className="business-investment-list">
      {investments.map((investment) => {

        const purchases = Array.isArray(investment.purchases) ? investment.purchases : [];

        const investorCount = new Set(
          purchases.map((p) => p?.user_id).filter(Boolean)
        ).size;


        const percentSold = getFundingPercent(investment);

        return (
          <div key={investment.id} className="business-investment-card">
            {isMobile ? (
              <div className="investment-mobile-wrapper">
                {/* ✅ full-width heading outside the card */}
                <div className="investment-mobile-heading">Investment Offer</div>

                {/* ✅ the card */}
                <div className="investment-mobile-card">
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

                  {/* ✅ Details button goes INSIDE card at the bottom */}
                  <button
                    className="investment-mobile-details-btn"
                    onClick={() => navigate(`/investment-details/${investment.id}`)}
                  >
                    Details
                  </button>
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
