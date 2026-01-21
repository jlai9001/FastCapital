import "./create-investment.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client.js";
import { useProtectedData } from "../context/protected-data-provider.jsx";

export default function NewInvestment() {
  const [sharesAvailable, setSharesAvailable] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");
  const [minInvestment, setMinInvestment] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { myBusiness, refreshProtectedData, status } = useProtectedData();
  const business = myBusiness;

  const nav = useNavigate();
  const businessId = business?.id;

  const handlePost = async () => {
    try {
      // business ID guard
      if (!businessId) {
        if (status === "loading" || status === "idle") {
          alert("Business is still loading. Please wait and try again.");
        } else {
          alert("No business found. Please create a business profile first.");
        }
        return;
      }

      setSubmitting(true);

      // Convert inputs to numbers once (state stays string so inputs don't get stuck on "0")
      const shares = Number(sharesAvailable);
      const minInv = Number(minInvestment);
      const price = Number(pricePerShare);

      const validate = () => {
        if (!Number.isFinite(shares) || shares <= 0) {
          alert("Please enter shares available.");
          throw new Error("shares invalid");
        }
        if (shares % 100 !== 0) {
          alert("Available shares must be divisible by 100.");
          throw new Error("shares not divisible by 100");
        }

        if (!Number.isFinite(minInv) || minInv <= 0) {
          alert("Please enter a minimum investment.");
          throw new Error("min invalid");
        }
        if (minInv > shares) {
          alert("Minimum shares invested must be less than shares available.");
          throw new Error("min > shares");
        }

        if (!Number.isFinite(price) || price <= 0) {
          alert("Please enter a price per share.");
          throw new Error("price invalid");
        }

        if (!expirationDate) {
          alert("Please choose an expiration date.");
          throw new Error("Missing expiration date.");
        }

        const today = new Date();
        const expiry = new Date(`${expirationDate}T00:00:00.000Z`);
        const diffInDays =
          (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);

        if (diffInDays < 30) {
          alert("Expiration date must be at least 30 days from today.");
          throw new Error("Invalid expiration date.");
        }
      };

      validate();

      const headers = { "Content-Type": "application/json" };

      const body = JSON.stringify({
        business_id: businessId,
        shares_available: shares,
        price_per_share: price,
        min_investment: minInv,
        start_date: new Date().toISOString(),
        expiration_date: `${expirationDate}T00:00:00.000Z`,
      });

      const response = await apiFetch(`/api/investment`, {
        method: "POST",
        headers,
        body,
      });

      // ✅ If offer already exists (backend returns 409)
      if (response.status === 409) {
        console.warn("Investment Offer Already Exists for this Business");
        alert("Investment Offer Already Exists for this Business");
        return;
      }

      if (!response.ok) {
        const errorDetails = await response.json().catch(() => null);
        console.error("Detailed Error response:", errorDetails);
        throw new Error("Offer request failed.");
      }

      const data = await response.json();
      console.log("Offer submitted:", data);

      alert("Investment offer submitted successfully!");

      // ✅ Pull fresh investments + business data into the provider cache
      await refreshProtectedData();

      // ✅ Go directly to Business Profile so it's updated immediately
      nav("/business-profile", { replace: true });
    } catch (error) {
      console.error("Error submitting:", error);
      alert("Failed to submit, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    nav(-1);
  };

  return (
    <div className="create-investment-container">
      <div className="create-investment-form">
        <div className="title">Create Investment</div>

        <div>
          <div className="field-label">How many shares are you offering in total?</div>
          <input
            className="create-investment-input"
            type="number"
            value={sharesAvailable}
            min="1"
            step="100"
            inputMode="numeric"
            placeholder="0"
            onChange={(e) => setSharesAvailable(e.target.value)}
          />
        </div>
        <br />

        <div>
          <div className="field-label">What is the minimum number of shares per purchase?</div>
          <input
            className="create-investment-input"
            type="number"
            value={minInvestment}
            min="1"
            inputMode="numeric"
            placeholder="0"
            onChange={(e) => setMinInvestment(e.target.value)}
          />
        </div>
        <br />

        <div className="field-label">What is the price per share in USD?</div>
        <div>
          <input
            className="create-investment-input"
            type="number"
            value={pricePerShare}
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="0"
            onChange={(e) => setPricePerShare(e.target.value)}
          />
        </div>
        <br />

        <div>
          <div className="field-label">What is the expiration date?</div>
          <input
            className="create-investment-input"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
          />
        </div>

        <br />

        <div className="button-container">
          <button className="cancel-button" onClick={handleCancel}>
            Cancel
          </button>

          <button
            className="post-button"
            onClick={handlePost}
            disabled={submitting || status === "loading" || status === "idle" || !business}
          >
            {submitting ? "Posting..." : "Post Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}
