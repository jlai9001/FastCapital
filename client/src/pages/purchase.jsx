import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useInvestment,
  useBusiness,
  useInvestmentPurchases,
} from "../hooks/getData";
import { useUser } from "../context/user-provider";
import PaymentModal from "./payment_modal";
import "./purchase.css";
import locationIcon from "../assets/location_icon.png";
import urlIcon from "../assets/url_icon.png";
import businessPlaceholder from "../assets/business_placeholder.png";

export default function Purchase() {
  const nav = useNavigate();
  const { investmentId } = useParams();
  const { userId } = useUser();

  const {
    data: investment,
    loading: investmentLoading,
    error: investmentError,
  } = useInvestment(investmentId);
  const {
    data: business,
    loading: businessLoading,
    error: businessError,
  } = useBusiness(investment?.business_id);
  const {
    data: purchases,
    loading: purchasesLoading,
    error: purchasesError,
  } = useInvestmentPurchases(investmentId);

  const [shareAmount, setShareAmount] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0.0);
  const [showModal, setShowModal] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);


  useEffect(() => {
    if (investment) {
      setTotalPrice(shareAmount * investment.price_per_share);
    }
  }, [shareAmount, investment]);

  if (investmentLoading || businessLoading || purchasesLoading)
    return <p>Loading...</p>;
  if (investmentError || businessError || purchasesError)
    return (
      <p>
        Error:{" "}
        {investmentError?.message ||
          businessError?.message ||
          purchasesError?.message}
      </p>
    );
  if (!investment || !business) return <p>Data not found.</p>;

  const totalSharesPurchased =
    purchases?.reduce((sum, purchase) => sum + purchase.shares_purchased, 0) ||
    0;
  const shares_available = investment.shares_available - totalSharesPurchased;
  const percentSold = (
    (totalSharesPurchased / investment.shares_available) *
    100
  ).toFixed(1);

  function handleShareAmount(e) {
    if (!investment) return;

    let value = parseInt(e.target.value, 10);
    const max = shares_available;
    const min = investment.min_investment;

    if (isNaN(value) || value < 0) value = 0;
    if (value > max) value = max;
    if (value % min !== 0) {
      value = Math.floor(value / min) * min;
    }

    setShareAmount(value);
  }

  function modalPop() {
    if (shareAmount > 0) {
      setShowModal(true);
    } else {
      alert("Please enter a valid number of shares");
    }
  }

  function handleModalClose() {
    setShowModal(false);
  }

  function handleCancel() {
    nav(-1);
  }

  return (
    <div className="page-container">
      <div className="top-half">
        <div className="column column-1">
          <div className="box image-wrapper">
            <img
              src={business.image_url || businessPlaceholder}
              alt={business.name}
              className="business-image"
            />
          </div>
        </div>
        <div className="column column-2">
          <div className="box">
            <h2 className="business-detail-name">{business.name}</h2>
          </div>
          <div className="box">
            <h4 className="location-text">
              <img
                src={locationIcon}
                alt="Location Icon"
                className="location-icon"
              />
              &nbsp; {business.city}, {business.state}
            </h4>
          </div>
          <div className="box">
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
        <div className="column column-3">
          <div className="nested-column top">
            <div className="nested-box top">
              <h3 className="box-quantity">{shares_available}</h3>
            </div>
            <div className="nested-box bottom">
              <p className="business-detail-text">Shares Available</p>
            </div>
          </div>
          <div className="nested-column bottom">
            <div className="nested-box top">
              <h3 className="box-quantity">{investment.min_investment}</h3>
            </div>
            <div className="nested-box bottom">
              <p className="business-detail-text">Minimum Investment</p>
            </div>
          </div>
        </div>
        <div className="column column-4">
          <div className="nested-column top">
            <div className="nested-box top">
              <h3 className="box-quantity">${investment.price_per_share}</h3>
            </div>
            <div className="nested-box bottom">
              <p className="business-detail-text">Price/Share</p>
            </div>
          </div>
          <div className="nested-column bottom">
            <div className="nested-box top">
              <h3 className="box-quantity">
                {new Date(investment.expiration_date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </h3>
            </div>
            <div className="nested-box bottom">
              <p className="business-detail-text">Offer Expires</p>
            </div>
          </div>
        </div>
      </div>
      <div className="progress-purchase-container">
        <div className="progress-bar-wrapper">
          <p className="progress-label">Funded</p>
          <div className="progress-bar-row">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${percentSold}%` }}
              ></div>
            </div>
            <p className="funded-percentage">{percentSold}%</p>
          </div>
        </div>
      </div>

    <div className="bottom-half">
        <div className="price-row">
          <span className="price-label">Price Per Share</span>
          <span className="price-value">${investment.price_per_share}</span>
        </div>

        <div className="shares-input-container">
          <div className="shares-label">Number of Shares</div>
          <div className="shares-input-row">
            <button className="share-btn" onClick={() => setShareAmount(prev => Math.max(prev - investment.min_investment, 0))}>−</button>
            <input
              type="number"
              className="share-input"
              value={shareAmount}
              onChange={handleShareAmount}
              min={0}
              max={investment.shares_available}
              step={investment.min_investment}
            />
            <button className="share-btn" onClick={() => {
              const next = shareAmount + investment.min_investment;
              if (next <= investment.shares_available) setShareAmount(next);
            }}>+</button>
        </div>

        <div className="total-price-row">
          <span className="total-label">Total Price</span>
          <span className="total-value">${totalPrice}</span>
        </div>
        <label className="terms-and-conditions">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={() => setTermsAccepted(prev => !prev)}
          />
          <span>I have read and accept the <a href="#" className="terms-link">Investor Terms & Conditions</a></span>
        </label>
        <div className="purchase-actions">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button
            className="buy-btn"
            onClick={modalPop}
            disabled={shareAmount <= 0 || !termsAccepted}
          >
            Purchase
          </button>
        </div>
    </div>
  </div>


      {showModal && investment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <PaymentModal
              onClose={handleModalClose}
              investment={investment}
              userId={userId}
              shareAmount={shareAmount}
            />
          </div>
        </div>
      )}
    </div>
  );
}
