import { useNavigate , useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import FinancialDashboard from "../components/financials_table";
import InvestmentCardsByBusinessId from "../components/investment-cards-by-businessID.jsx";
import { useProtectedData } from "../context/protected-data-provider.jsx";
import "./business-profile.css";
import locationIcon from "../assets/location_icon.png";
import urlIcon from "../assets/url_icon.png";
import coinIcon from "../assets/coin.svg";
import placeholder from "../assets/business_placeholder.png";
import { base_url } from "../api";
import Spinner from "../components/spinner.jsx";

export default function BusinessProfile() {
  const navigate = useNavigate();
  const location = useLocation();

  const { status, myBusiness, businessFinancials, businessInvestments } = useProtectedData();

  const business = myBusiness;
  const financials = businessFinancials;
  const investments = businessInvestments;

  const loading = status === "loading" || status === "idle";
  const error = status === "error";

  const financialsLoading = loading;
  const investmentsLoading = loading;
  const financialsError = error;
  const investmentsError = error;

  const [imageVersion, setImageVersion] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);


    // ✅ If we arrived here from AddBusiness with a cache-buster, use it (then clear it)
    useEffect(() => {
      const buster = location.state?.imageBuster;

      if (buster) {
        setImageVersion(buster);

        // ✅ clear the state so it only triggers once
        navigate(location.pathname, { replace: true, state: {} });
      }
    }, [location.state, location.pathname, navigate]);



  // ✅ Fallback: if image_url changes (and we DIDN'T get a buster), refresh anyway
  useEffect(() => {
    const buster = location.state?.imageBuster;
    if (!buster && business?.image_url) {
      setImageVersion(Date.now());
    }
  }, [business?.image_url, location.state]);


  if (loading) return <div />; // or your page spinner

  if (error) return <h1>Could not load business profile.</h1>;

  if (!business) {
    return (
      <div className="full-screen-wrapper">
        <div className="no-business-container">
          <p className="no-business-header">Create a Business Profile</p>
          <img src={coinIcon} alt="Coin Icon" className="profil-coin-icon" />
          <button
            className="no-business-button"
            onClick={() => navigate("/add-business", { state: { mode: "create" } })}
          >
            Add Your Business
          </button>
        </div>
      </div>
    );
  }

  const isValidImagePath =
    business.image_url && !business.image_url.startsWith("data:image");

  const resolvedImageUrl = business?.image_url
  ? (business.image_url.startsWith("http")
      ? business.image_url
      : business.image_url.startsWith("/images/")
        ? `${base_url}${business.image_url}`
        : `${base_url}/images/${business.image_url}`)
  : null;

const canShowFreshImage = isValidImagePath && imageVersion && resolvedImageUrl;

const imageSrc = canShowFreshImage
  ? `${resolvedImageUrl}?v=${imageVersion}`
  : placeholder;

// Show spinner only while a real (non-placeholder) image is loading
useEffect(() => {
  if (imageSrc && imageSrc !== placeholder) {
    setImageLoading(true);
  } else {
    setImageLoading(false);
  }
}, [imageSrc]);

  return (
    <div className="business-profile-container">
      <div className="business-profile-header-row">
        <p className="business-profile-header">Business profile</p>
        <button
          className="business-profile-page-button"
          onClick={() => navigate("/add-business", { state: { mode: "edit" } })}
        >
          Edit Profile Details
        </button>
      </div>

      <div className="business-info">
        <div className="business-image-container">
          <div className="image-wrapper">
          {imageLoading && (
            <div className="business-image-spinner-overlay">
              <Spinner size={34} label="Loading business image" className="business-image-spinner" />

            </div>
          )}

          <img
              src={imageSrc}
              alt={business.name}
              className="business-image"
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
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
          <FinancialDashboard financials={financials} />
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
          <InvestmentCardsByBusinessId investments={investments} />

        )}
      </div>
    </div>
  );
}
