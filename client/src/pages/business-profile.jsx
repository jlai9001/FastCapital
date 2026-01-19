import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import FinancialDashboard from "../components/financials_table";
import InvestmentCardsByBusinessId from "../components/investment-cards-by-businessID.jsx";
import {
  useBusinessForUser,
  useFinancialsForBusiness,
  useInvestmentsForBusiness,
} from "../hooks/getData.jsx";
import "./business-profile.css";
import locationIcon from "../assets/location_icon.png";
import urlIcon from "../assets/url_icon.png";
import coinIcon from "../assets/coin.svg";
import placeholder from "../assets/business_placeholder.png";
import { base_url } from "../api";


export default function BusinessProfile() {
  const navigate = useNavigate();

  const { business, loading, error } = useBusinessForUser();
  const [imageVersion, setImageVersion] = useState(0);

  const {
    financials,
    loading: financialsLoading,
    error: financialsError,
  } = useFinancialsForBusiness(business?.id);

  const {
    investments,
    loading: investmentsLoading,
    error: investmentsError,
  } = useInvestmentsForBusiness(business?.id);

  // 🔑 FORCE IMAGE REFRESH WHEN IMAGE_URL CHANGES
  useEffect(() => {
    if (business?.image_url) {
      setImageVersion(Date.now());
    }
  }, [business?.image_url]);

  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>{error.message}</h1>;

  if (!business) {
    return (
      <div className="full-screen-wrapper">
        <div className="no-business-container">
          <img src={coinIcon} alt="Coin Icon" className="profil-coin-icon" />
          <p className="no-business-header">Create a Business Profile</p>
          <button
            className="no-business-button"
            onClick={() => navigate("/add-business")}
          >
            Add Your Business
          </button>
        </div>
      </div>
    );
  }

  const isValidImagePath =
    business.image_url && !business.image_url.startsWith("data:image");

  return (
    <div className="business-profile-container">
      <div className="business-profile-header-row">
        <p className="business-profile-header">Business profile</p>
        <button
          className="business-profile-page-button"
          onClick={() => navigate("/add-business")}
        >
          Edit Profile Details
        </button>
      </div>

      <div className="business-info">
        <div className="business-image-container">
          <div className="image-wrapper">
            <img
              src={
                isValidImagePath
                  ? `${
                      business.image_url.startsWith("http")
                        ? business.image_url
                        : business.image_url.startsWith("/images/")
                          ? `${base_url}${business.image_url}`
                          : `${base_url}/images/${business.image_url}`
                    }?v=${imageVersion}`
                  : placeholder
              }
              alt={business.name}
              className="business-image"
              onError={(e) => {
                e.currentTarget.src = placeholder;
              }}
            />
          </div>
        </div>

        <div className="business-details">
          <p className="business-profile-name">{business.name}</p>

          <p className="business-location">
            <img
              src={locationIcon}
              alt="Location Icon"
              className="location-icon"
            />
            &nbsp;{business.city}, {business.state}
          </p>

          <p>
            <a
              className="business-website"
              href={business.website_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={urlIcon}
                alt="URL Icon"
                className="website-icon"
              />
              &nbsp;&nbsp;
              {business.website_url.replace(/^https?:\/\/(www\.)?/, "")}
            </a>
          </p>
        </div>
      </div>

      <div className="business-profile-header-row">
        <p className="business-profile-subheader">Financial Details</p>
        <a
          className="business-profile-page-button"
          href={`/create-financials/${business.id}`}
        >
          Add Financial Details
        </a>
      </div>

      <div className="financial-dashboard-container">
        {financialsLoading ? (
          <h3>Loading Financials...</h3>
        ) : financialsError ? (
          <h2>Error loading financials</h2>
        ) : financials && financials.length > 0 ? (
          <FinancialDashboard businessId={business.id} />
        ) : (
          <div className="no-financials-container">
            <div className="no-financials-text">
              Add financial details to attract more investors.
            </div>
          </div>
        )}
      </div>

      <div className="business-profile-header-row">
        <p className="business-profile-subheader">Investment Offers</p>
        <a className="business-profile-page-button" href="/create-investment">
          Add Investment Offer
        </a>
      </div>

      <div className="business-investment-container">
        {investmentsLoading && <p>Loading investments...</p>}
        {investmentsError && <p>Error loading investments.</p>}

        {!investmentsLoading && investments && (
          <InvestmentCardsByBusinessId businessId={business.id} />
        )}
      </div>
    </div>
  );
}
