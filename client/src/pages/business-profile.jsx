import { useNavigate } from "react-router-dom";
import { useState } from "react";
import FinancialDashboard from "../components/financials_table";
import InvestmentCardsByBusinessId from "../components/investment-cards-by-businessID.jsx";
import { useBusinessForUser, useFinancialsForBusiness, useInvestmentsForBusiness, useBusiness, uploadBusinessImage } from "../hooks/getData.jsx";
import "./business-profile.css";
import locationIcon from "../assets/location_icon.png";
import urlIcon from "../assets/url_icon.png";
import coinIcon from "../assets/coin.svg";
import { set } from "date-fns";

export default function BusinessProfile() {
    const navigate = useNavigate();
    const { business, loading, error } = useBusinessForUser();
    const isOwner = business?.id !== undefined;
    const [selectedFile, setSelectedFile] = useState(null);

    const {
      financials, loading: financialsLoading, error: financialsError
    } = useFinancialsForBusiness(business?.id);

    const {
      investments,
      loading: investmentsLoading,
      error: investmentsError,
    } = useInvestmentsForBusiness(business?.id);

    if (loading) return <h1> Loading... </h1>
    if (error) return <h1> {error.message} </h1>

    if (!business) {
    return (
      <div className="full-screen-wrapper">
        <div className="no-business-container">
          <img
            src={coinIcon}
            alt="Coin Icon"
            className="profil-coin-icon"
          />
            <p className="no-business-header">Create a Business Profile</p>
            <p className="no-business-text">It looks like you don't have a business profile yet.</p>
            <button className="no-business-button" onClick={() => navigate("/add-business")}>Add Your Business</button>
        </div>
      </div>
  );
}

      const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
      };

      const handleImageUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      const updated = await uploadBusinessImage(business.id, selectedFile);
      // Ideally refetch business here
      window.location.reload(); // or force re-render
    } catch (err) {
      console.error(err.message);
    }
  };

    return (
        <div className="business-profile-container">
          <div className="business-profile-header-row">
            <p className="business-profile-header">Business profile</p>
            <a className="business-profile-page-button" href="/edit-business">Edit Profile Details</a>
          </div>
            <div className="business-info">
                <div className="business-image-container">
                  <div className="image-wrapper">
                    <img
                      src={business.image_url || "https://via.placeholder.com/150"}
                      alt={business.name}
                      className="business-image"
                    />
                  </div>

                  {/* {isOwner && (
                    <div className="upload-box">
                      <form className="upload-image-form" onSubmit={handleImageUpload}>
                        <input className="choose-file-button" type="file" accept="image/*" onChange={handleFileChange} required />
                        <button className="upload-image-button" type="submit">Upload Image</button>
                      </form>
                    </div>
                  )} */}
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
                      &nbsp;&nbsp;{business.website_url.replace(/^https?:\/\/(www\.)?/, '')}
                    </a>
                  </p>
                </div>
              </div>

          <div className="business-profile-header-row">
            <p className="business-profile-subheader">Financial Details</p>
            <a className="business-profile-page-button" href="/create-financials">Add Financial Details</a>
          </div>
          <div className="financial-dashboard-container">
            {financialsLoading ? (
              <h3>Loading Financials...</h3>
            ) : financialsError ? (
              <h2>Error loading financials: {financialsError.message}</h2>
            ) : financials && financials.length > 0 ? (
              <FinancialDashboard businessId={business.id} />
            ) : (
                <div className="no-financials-container">
                  <p className="no-financials-header">Add Financial Details to Your Business</p>
                  <p className="no-financials-text">It looks like you haven't added financial performance data.</p>
                  <p className="no-financials-text">Add your data from your income statement and balance sheet to attract more investors.</p>
        </div>
            )}
          </div>
          <div className="business-profile-header-row">
            <p className="business-profile-subheader">Investment Offers</p>
            <a className="business-profile-page-button" href="/create-investment">Add Investment Offer</a>
          </div>
          <div className="business-investment-container">

  {investmentsLoading && <p>Loading investments...</p>}
  {investmentsError && <p>Error loading investments.</p>}

  {!investmentsLoading && !investments && (
    <div className="no-investments-container">
      <p className="no-investment-header">Create an Investment Offer</p>
      <p className="no-investment-text">You haven't created any offers yet.</p>
      <p className="no-investment-text">Create an offer so that potential investors know what you're looking for.</p>
    </div>
  )}

  {!investmentsLoading && investments && (
    <>
      <InvestmentCardsByBusinessId businessId={business.id} />
    </>
  )}
        </div>
        </div>
      );
    }
