import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useInvestment,
  useBusiness,
  useInvestmentPurchases,
} from "../hooks/getData";
import FinancialDashboard from "../components/financials_table";
import "./investments-details.css";
import locationIcon from "../assets/location_icon.png";
import urlIcon from "../assets/url_icon.png";
import placeholder from "../assets/business_placeholder.png";
import {base_url} from "../api";
import {useUser} from "../context/user-provider";
import {useState,useEffect} from "react";


export default function InvestmentDetails() {
  const [imageVersion, setImageVersion] = useState(0);
  const { investmentId } = useParams();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const { user } = useUser();

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
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
  if (business?.image_url) {
    setImageVersion(Date.now());
  }
  }, [business?.image_url]);

  const {
    loading: purchasesLoading,
    error: purchasesError,
    data: purchases,
  } = useInvestmentPurchases(investmentId, !!user);

  if (investmentLoading || businessLoading) return <h1> Loading... </h1>;
  if (investmentError || businessError)
    return <h1> {investmentError || businessError} </h1>;
  if (!investment || !business)
    return <h1>Unable to retreive investment data.</h1>;

  const totalSharesPurchased =
    purchases?.reduce((sum, p) => sum + p.shares_purchased, 0) || 0;
  const totalShares = totalSharesPurchased + investment.shares_available;
  const percentSold = (totalSharesPurchased / totalShares) * 100;

  const handlePurchaseClick = () => {
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
          <div className="investment-box">
            <p className="investment-detail-business-name">{business.name}</p>
          </div>
          <div className="investment-box">
            <div className="investment-details-location">
              <img
                src={locationIcon}
                alt="Location Icon"
                className="location-icon"
              />
              &nbsp; {business.city}, {business.state}
            </div>
          </div>
            <div className="investment-box">

        <a
          className="investment-details-website"
          href={business.website_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={urlIcon} alt="URL Icon" className="website-icon" />
          {business.website_url.replace(/^https?:\/\/(www\.)?/, "")}
        </a>
      </div>

        </div>
        <div className="investment-column investment-column-3">
          <div className="investment-nested-column investment-top">
            <div className="investment-nested-box investment-top">
              <div className="investment-box-quantity">
                {investment.shares_available}
              </div>
            </div>
            <div className="investment-nested-box investment-bottom">
              <div className="investment-business-detail-text">
                Shares Available
              </div>
            </div>
          </div>
          <div className="investment-nested-column investment-bottom">
            <div className="investment-nested-box investment-top">
              <div className="investment-box-quantity">
                {investment.min_investment}
              </div>
            </div>
            <div className="investment-nested-box investment-bottom">
              <div className="investment-business-detail-text">
                Minimum Investment
              </div>
            </div>
          </div>
        </div>
        <div className="investment-column investment-column-4">
          <div className="investment-nested-column investment-top">
            <div className="investment-nested-box investment-top">
              <div className="investment-box-quantity">
                ${investment.price_per_share}
              </div>
            </div>
            <div className="investment-nested-box investment-bottom">
              <div className="investment-business-detail-text">Price/Share</div>
            </div>
          </div>
          <div className="investment-nested-column investment-bottom">
            <div className="investment-nested-box investment-top">
              <div className="investment-box-quantity">
                {new Date(investment.expiration_date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
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
              <div
                className="progress-fill"
                style={{ width: `${percentSold}%` }}
              ></div>
            </div>
            <p className="funded-percentage">{percentSold.toFixed(0)}%</p>
          </div>
        </div>
      <div className="purchase-button-container">
        <button
          disabled={!user}
          onClick={handlePurchaseClick}
          className="invest-now-button"
        >
          Purchase Investment
        </button>
        {!user && (
          <p className="login-message">
            You must{" "}
            <Link to="/login" className="login-link">
              login
            </Link>{" "}
            in order to become an investor.
          </p>
        )}
      </div>
      </div>
      <div className="financial-dashboard-container">
        {business?.id && (
          isMobile ? (
            <div className="financial-dashboard-mobile">
              <FinancialDashboard businessId={business.id} />
            </div>
          ) : (
            <FinancialDashboard businessId={business.id} />
          )
        )}
      </div>
    </div>
  );
}
