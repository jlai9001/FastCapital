import "./create-investment.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client.js";
import { useProtectedData } from "../context/protected-data-provider.jsx";

// ✅ Same MUI DatePicker stack as create-financials
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

export default function NewInvestment() {
  const [sharesAvailable, setSharesAvailable] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");
  const [minInvestment, setMinInvestment] = useState("");
  const [expirationDate, setExpirationDate] = useState(null); // ✅ Date | null
  const [submitting, setSubmitting] = useState(false);

  const { myBusiness, refreshProtectedData, status } = useProtectedData();
  const business = myBusiness;

  const nav = useNavigate();
  const businessId = business?.id;

  // ✅ Avoid timezone off-by-one: send UTC midnight
  const toUtcMidnightIso = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const d = dateObj.getDate();
    return new Date(Date.UTC(y, m, d, 0, 0, 0, 0)).toISOString();
  };

  const toUtcMidnightDate = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth();
    const d = dateObj.getDate();
    return new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
  };

  const utcTodayMidnight = () => {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  };

  const handlePost = async () => {
    try {
      if (!businessId) {
        if (status === "loading" || status === "idle") {
          console.log("Business is still loading");
        } else {
          console.log("No business found, create a business");
        }
        return;
      }

      setSubmitting(true);

      const shares = Number(sharesAvailable);
      const minInv = Number(minInvestment);
      const price = Number(pricePerShare);

      const validate = () => {
        if (!Number.isFinite(shares) || shares <= 0) {
          console.log("Enter shares");
          throw new Error("shares invalid");
        }
        if (shares % 10 !== 0) {
          console.log("Total shares must be divisible by 10");co
          throw new Error("shares not divisible by 10");
        }

        if (!Number.isFinite(minInv) || minInv <= 0) {
          console.log("Enter minimum shares per purchase");
          throw new Error("min invalid");
        }
        if (minInv > shares) {
          console.log("Minimum shares invested must be less than shares available");
          throw new Error("min > shares");
        }

        if (!Number.isFinite(price) || price <= 0) {
          console.log("Enter price per share");
          throw new Error("price invalid");
        }

        if (!expirationDate) {
          console.log("Enter expiration date.");
          throw new Error("Missing expiration date.");
        }

        const today = utcTodayMidnight();
        const expiry = toUtcMidnightDate(expirationDate);

        const diffInDays = (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);
        if (diffInDays < 30) {
          console.log("Expiration date must be 30 days ahead from today.");
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
        expiration_date: toUtcMidnightIso(expirationDate),
      });

      const response = await apiFetch(`/api/investment`, {
        method: "POST",
        headers,
        body,
      });


      if (!response.ok) {
        const errorDetails = await response.json().catch(() => null);
        console.error("Detailed Error response:", errorDetails);
        throw new Error("Offer request failed.");
      }

      const data = await response.json();
      console.log("Offer submitted:", data);

      console.log("Investment offer submitted successfully!");
      await refreshProtectedData();
      nav("/business-profile", { replace: true });
    } catch (error) {
      console.error("Error submitting:", error);
      console.log("Failed to submit");
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

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={expirationDate}
              onChange={(newValue) => setExpirationDate(newValue)}
              format="MM/dd/yyyy"
              localeText={{
                fieldMonthPlaceholder: () => "mm",
                fieldDayPlaceholder: () => "dd",
                fieldYearPlaceholder: () => "yyyy",
              }}
              slotProps={{
                textField: {
                  className: "create-investment-date",
                  helperText: null,
                  InputLabelProps: { shrink: true },
                },
              }}
            />
          </LocalizationProvider>
        </div>

        <br />

        <div className="button-container-createinvestment">
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
