import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useInvestment,
  useBusiness,
} from "../hooks/getData";
import FinancialDashboard from "../components/financials_table";
import "./investments-details.css";
import locationIcon from "../assets/location_icon.png";
import urlIcon from "../assets/url_icon.png";
import placeholder from "../assets/business_placeholder.png";
import { base_url } from "../api";
import { useUser } from "../context/user-provider";
import { useState, useEffect } from "react";
import { getFundingPercent } from "../utils/investmentFunding";


function getAccessToken() {
  return localStorage.getItem("access_token");
}

export default function InvestmentDetails() {
  const [imageVersion, setImageVersion] = useState(0);
  const { investmentId } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const { user } = useUser();

  const [financials, setFinancials] = useState([]);
  const [financialsLoading, setFinancialsLoading] = useState(false);
  const [financialsError, setFinancialsError] = useState(null);

  const {
    loading: investmentLoading,
    error: investmentError,
    data: investment,
  } = useInvestment(investmentId);

  const {
    loading: businessLoading,
    error: businessError,
    data: business,
  } = useBusiness(investment?.business_id);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (business?.image_url) setImageVersion(Date.now());
  }, [business?.image_url]);


  // ✅ NEW: fetch financials once we know the business id
  useEffect(() => {
    const fetchFinancials = async () => {
      if (!business?.id) return;

      setFinancialsLoading(true);
      setFinancialsError(null);

      try {
        const token = getAccessToken();
        const res = await fetch(`${base_url}/api/financials/${business.id}`, {
          credentials: "include",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!res.ok) {
          throw new Error(`Failed to load financials (${res.status})`);
        }

        const data = await res.json();
        setFinancials(Array.isArray(data) ? data : []);
      } catch (err) {
        setFinancialsError(err.message || "Failed to load financials.");
        setFinancials([]);
      } finally {
        setFinancialsLoading(false);
      }
    };

    fetchFinancials();
  }, [business?.id]);

  if (investmentLoading || businessLoading) return <h1> Loading... </h1>;
  if (investmentError || businessError)
    return <h1> {investmentError || businessError} </h1>;
  if (!investment || !business) return <h1>Unable to retreive investment data.</h1>;

  // use single truth of funding percentage
  const percentSold = getFundingPercent(investment);

  // ✅ Sold-out protection (shares_available <= 0)
  const sharesLeftNum = Number(investment?.shares_available);
  const isSoldOut = Number.isFinite(sharesLeftNum) && sharesLeftNum <= 0;


  const handlePurchaseClick = () => {
    if (isSoldOut) return; // ✅ don't navigate to purchase if fully funded
    navigate(`/investment-details/${investment.id}/purchase`);
  };

  return (
    <div className="investment-details-page-container">
      <div className="investment-details-info-container">
        <div className="investment-column investment-column-1">
          <div className="box business-detail-image-wrapper">
            <img
              src={
                business?.image_url
                  ? `${
                      business.image_url.startsWith("http")
                        ? business.image_url
                        : `${base_url}${business.image_url}`
                    }?v=${imageVersion}`
                  : placeholder
              }
              alt={business.name}
              className="business-detail-image"
              onError={(e) => {
                e.currentTarget.src = placeholder;
              }}
            />
          </div>
        </div>

        <div className="investment-column investment-column-2">
          <p className="investment-detail-business-name">{business.name}</p>

          {/* desktop will display these side-by-side; mobile remains stacked by default */}
          <div className="investment-details-subrow">
            <div className="investment-details-location">
              <img src={locationIcon} alt="Location Icon" className="location-icon" />
              <span>
                {business.city}, {business.state}
              </span>
            </div>

            <a
              className="investment-details-website"
              href={business.website_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={urlIcon} alt="URL Icon" className="website-icon" />
              <span>{(business.website_url || "").replace(/^https?:\/\/(www\.)?/, "")}</span>
            </a>
          </div>
        </div>

        {/* Desktop-only flex line break: forces metrics (cols 3 & 4) onto row 2 */}
        <div className="investment-details-flex-break" aria-hidden="true" />


        <div className="investment-column investment-column-3">
          <div className="investment-nested-column investment-top">
            <div className="investment-nested-box investment-top">
              <div className="investment-box-quantity">{investment.shares_available}</div>
            </div>
            <div className="investment-nested-box investment-bottom">
              <div className="investment-business-detail-text">Shares Available</div>
            </div>
          </div>

          <div className="investment-nested-column investment-bottom">
            <div className="investment-nested-box investment-top">
              <div className="investment-box-quantity">{investment.min_investment}</div>
            </div>
            <div className="investment-nested-box investment-bottom">
              <div className="investment-business-detail-text">Minimum Investment</div>
            </div>
          </div>
        </div>

        <div className="investment-column investment-column-4">
          <div className="investment-nested-column investment-top">
            <div className="investment-nested-box investment-top">
              <div className="investment-box-quantity">${investment.price_per_share}</div>
            </div>
            <div className="investment-nested-box investment-bottom">
              <div className="investment-business-detail-text">Price/Share</div>
            </div>
          </div>

          <div className="investment-nested-column investment-bottom">
            <div className="investment-nested-box investment-top">
              <div className="investment-box-quantity">
                {new Date(investment.expiration_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="investment-nested-box investment-bottom">
              <div className="investment-business-detail-text">Offer Expires</div>
            </div>
          </div>
        </div>
      </div>

      <div className="progress-purchase-container">
        <div className="investment-progress-wrapper">
          <p className="progress-label">Funded</p>
          <div className="progress-bar-row">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${percentSold}%` }} />
            </div>
            <p className="funded-percentage">{percentSold.toFixed(0)}%</p>
          </div>
        </div>

        <div className="purchase-button-container">

      <button
        disabled={!user || isSoldOut}
        onClick={handlePurchaseClick}
        className="invest-now-button"
      >
        {isSoldOut ? "Offer Fully Funded" : "Purchase"}
      </button>

      {isSoldOut && (
        <p className="login-message">
          This offer is fully funded and is no longer available for purchase.
        </p>
      )}

      {!user && !isSoldOut && (
        <p className="login-message">
          <Link to="/login" className="login-link">
            Login
          </Link>{" "}
          to purchase.
        </p>
      )}

        </div>
      </div>

      <div className="financial-dashboard-container">
        {financialsLoading && <p>Loading chart data...</p>}
        {financialsError && <p>{financialsError}</p>}

        {!financialsLoading && !financialsError && (
          isMobile ? (
            <div className="financial-dashboard-mobile">
              <FinancialDashboard financials={financials} />
            </div>
          ) : (
            <FinancialDashboard financials={financials} />
          )
        )}
      </div>
    </div>
  );
}
