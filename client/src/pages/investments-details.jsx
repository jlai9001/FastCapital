import { useParams, useNavigate } from "react-router-dom";
import { useInvestment, useBusiness, useInvestmentPurchases, useBusinessForUser, uploadBusinessImage } from "../hooks/getData";
import FinancialDashboard from "../components/financials_table";
import { useState } from "react";
import "./investments-details.css";

export default function InvestmentDetails() {
    const { investmentId } = useParams();
    const navigate = useNavigate();
    const { business: userBusiness, loading: userBusinessLoading } = useBusinessForUser();
    const [selectedFile, setSelectedFile] = useState(null);

    const {
        loading: investmentLoading,
        error: investmentError,
        data: investment,
    } = useInvestment(investmentId)

    const {
        loading: businessLoading,
        error: businessError,
        data: business,
    } = useBusiness(investment?.business_id)

    const {
        loading: purchasesLoading,
        error: purchasesError,
        data: purchases,
    } = useInvestmentPurchases(investmentId);

    if (investmentLoading || businessLoading) return <h1> Loading... </h1>
    if (investmentError || businessError) return <h1> {investmentError || businessError} </h1>
    if (!investment || !business) return <h1>Unable to retreive investment data.</h1>

    const isOwner = userBusiness?.id === business.id;

    const totalSharesPurchased = purchases?.reduce((sum, purchase) => sum + purchase.shares_purchased, 0) || 0;
    const shares_available = investment.shares_available - totalSharesPurchased;
    const uniqueInvestorIds = new Set(purchases?.map(p => p.user_id));
    const number_of_investors = uniqueInvestorIds.size;
    const percentSold = (totalSharesPurchased / investment.shares_available) * 100;

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

    const handlePurchaseClick = () => {
        navigate (`/investment-details/${investment.id}/purchase`);
    };

    return (
        <>
        <div className="investment-details-container">
          <div className="column column-1">
            <div className="box image-wrapper">
            <img
                src={business.image_url || "https://via.placeholder.com/150"}
                alt={business.name}
                className="business-image"
              />
          </div>
          {isOwner && (
            <div className="box upload-box">
              <form className="upload-image-form" onSubmit={handleImageUpload}>
                <input type="file" accept="image/*" onChange={handleFileChange} required />
                <button type="submit">Upload Image</button>
              </form>
            </div>
          )}
          </div>
          <div className="column column-2">
            <div className="box">
            <h2 className="business-name">{business.name}</h2>
            </div>
            <div className="box location">
          <h4>{business.city}, {business.state}</h4>
            </div>
            <div className="box">
            <p><a href={business.website_url} target="_blank" rel="noopener noreferrer">{business.website_url}</a></p>
            </div>
            </div>
            <div className="column column-3">
            <div className="nested-column top">
              <div className="nested-box top">
              <h3 className="box-quantity">{shares_available}</h3>
            </div>
              <div className="nested-box bottom">
                <p>Shares Available</p>
              </div>
              </div>
              <div className="nested-column bottom">
                <div className="nested-box top">
                <h3 className="box-quantity">{investment.min_investment}</h3>
                </div>
                <div className="nested-box bottom">
                <p>Minimum Investment</p>
                </div>
              </div>
            </div>
            <div className="column column-4">
            <div className="nested-column top">
              <div className="nested-box top">
              <h3 className="box-quantity">${investment.price_per_share}</h3>
            </div>
              <div className="nested-box bottom">
                <p>Price/Share</p>
              </div>
              </div>
              <div className="nested-column bottom">
                <div className="nested-box top">
                <h3 className="box-quantity">{new Date(investment.expiration_date).toLocaleDateString()}</h3>
                </div>
                <div className="nested-box bottom">
                <p>Offer Expires</p>
                </div>
              </div>
            </div>
            </div>
            <div className="progress-purchase-container">
              <div className="progress-bar-wrapper">
              <p className="progress-label">Funded</p>
                <div className="progress-bar-row">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${percentSold}%` }}></div>
                </div>
                <p>{percentSold}%</p>
              </div>
              </div>
            <button onClick={handlePurchaseClick} className="invest-now-button">
              Purchase Investment
            </button>
          </div>
          <div className="financial-dashboard-container">
          {business?.id && <FinancialDashboard businessId={business.id} />}
          </div>
          </>
      );
    }
