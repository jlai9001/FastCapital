import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
import { base_url } from "../api";

function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export default function Purchase() {
  const nav = useNavigate();
  const { investmentId } = useParams();
  const { user } = useUser();

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

  // ✅ Hooks MUST be above any conditional returns
  const handleModalClose = useCallback(() => {
    setShowModal(false);
  }, []);

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        handleModalClose();
      }
    },
    [handleModalClose]
  );

  useEffect(() => {
    if (!showModal) return;
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showModal, onKeyDown]);

  useEffect(() => {
    if (investment) {
      setTotalPrice(shareAmount * Number(investment.price_per_share));
    }
  }, [shareAmount, investment]);

  // ✅ Now safe to early-return
  if (investmentLoading || businessLoading || purchasesLoading) return <p>Loading...</p>;

  if (investmentError || businessError || purchasesError) {
    return (
      <p>
        Error:{" "}
        {investmentError?.message ||
          businessError?.message ||
          purchasesError?.message}
      </p>
    );
  }

  if (!investment || !business) return <p>Data not found.</p>;

  const resolvedImageUrl = business.image_url
    ? `${base_url}/uploaded_images/${business.image_url}`
    : businessPlaceholder;

  function handleShareAmount(e) {
    if (!investment) return;

    let value = parseInt(e.target.value, 10);
    const max = Number(investment.shares_available);
    const min = Number(investment.min_investment);

    if (isNaN(value) || value < 0) value = 0;
    if (value > max) value = max;

    if (min > 0 && value % min !== 0) {
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

  function handleCancel() {
    nav(-1);
  }

  const minStep = Number(investment.min_investment) || 1;
  const maxShares = Number(investment.shares_available) || 0;

  const decShares = () => {
    setShareAmount((prev) => Math.max(prev - minStep, 0));
  };

  const incShares = () => {
    const next = shareAmount + minStep;
    if (next <= maxShares) setShareAmount(next);
  };

  return (
    <>
      <div className="purchase-container">
        <div className="purchase-card">
          <h1 className="purchase-title">Purchase Investment</h1>

          <div className="purchase-business">
            <div className="purchase-avatar">
              <img
                src={resolvedImageUrl}
                alt={business.name}
                className="purchase-avatar-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = businessPlaceholder;
                }}
              />
            </div>

            <div className="purchase-business-info">
              <div className="purchase-business-name">{business.name}</div>

              <div className="purchase-meta-row">
                <img
                  src={locationIcon}
                  alt="Location Icon"
                  className="purchase-meta-icon"
                />
                <span className="purchase-meta-text">
                  {business.city}, {business.state}
                </span>
              </div>

              <a
                className="purchase-website"
                href={business.website_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={urlIcon}
                  alt="Website Icon"
                  className="purchase-meta-icon"
                />
                <span className="purchase-meta-text">
                  {business.website_url.replace(/^https?:\/\/(www\.)?/, "")}
                </span>
              </a>
            </div>
          </div>

          <div className="purchase-stats">
            <div className="purchase-stat">
              <div className="purchase-stat-label">Price Per Share</div>
              <div className="purchase-stat-value">
                ${formatMoney(investment.price_per_share)}
              </div>
            </div>

            <div className="purchase-stat">
              <div className="purchase-stat-label">Shares Available</div>
              <div className="purchase-stat-value">{investment.shares_available}</div>
            </div>

            <div className="purchase-stat">
              <div className="purchase-stat-label">Min Shares / Purchase</div>
              <div className="purchase-stat-value">{investment.min_investment}</div>
            </div>
          </div>

          <div className="purchase-divider" />

          <div className="purchase-field">
            <div className="purchase-label">Number of Shares</div>

            <div className="purchase-stepper">
              <button
                type="button"
                className="purchase-step-btn"
                onClick={decShares}
                aria-label="Decrease shares"
              >
                −
              </button>

              <input
                type="number"
                className="purchase-step-input"
                value={shareAmount}
                onChange={handleShareAmount}
                min={0}
                max={maxShares}
                step={minStep}
                inputMode="numeric"
              />

              <button
                type="button"
                className="purchase-step-btn"
                onClick={incShares}
                aria-label="Increase shares"
              >
                +
              </button>
            </div>

            <div className="purchase-helper">
              Must be in increments of <strong>{investment.min_investment}</strong>
            </div>
          </div>

          <div className="purchase-total-row">
            <span className="purchase-total-label">Total Price</span>
            <span className="purchase-total-value">${formatMoney(totalPrice)}</span>
          </div>

          <label className="purchase-terms">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={() => setTermsAccepted((prev) => !prev)}
            />
            <span>
              I have read and accept the{" "}
              <Link to="/terms" className="purchase-terms-link">
                Investor Terms &amp; Conditions
              </Link>
            </span>
          </label>

          <div className="purchase-actions">
            <button className="purchase-cancel-btn" onClick={handleCancel}>
              Cancel
            </button>

            <button
              className="purchase-buy-btn"
              onClick={modalPop}
              disabled={shareAmount <= 0 || !termsAccepted}
            >
              Purchase
            </button>
          </div>
        </div>
      </div>

      {showModal && investment && (
        <div
          className="purchase-modal-overlay"
          onClick={handleModalClose}
          role="presentation"
        >
          <div
            className="purchase-modal-content"
            onClick={(e) => e.stopPropagation()}
            role="presentation"
          >
            <PaymentModal
              onClose={handleModalClose}
              investment={investment}
              userId={user?.id}
              shareAmount={shareAmount}
            />
          </div>
        </div>
      )}
    </>
  );
}
