import "./create-investment.css";
import { useMemo, useState } from "react";
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

  // ✅ show warnings on blur (like signup/add-business)
  const [touched, setTouched] = useState({
    sharesAvailable: false,
    minInvestment: false,
    pricePerShare: false,
    expirationDate: false,
  });

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
    return new Date(
      Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0,
        0,
        0,
        0
      )
    );
  };

  const markTouched = (field) => {
    setTouched((p) => ({ ...p, [field]: true }));
  };

  const validateField = (field, value, all) => {
    // helpers
    const isBlank = (v) => String(v ?? "").trim() === "";
    const num = (v) => (isBlank(v) ? NaN : Number(v));

    if (field === "sharesAvailable") {
      if (isBlank(value)) return "Total shares is required.";
      const shares = num(value);
      if (!Number.isFinite(shares) || shares <= 0)
        return "Enter a valid total shares (must be > 0).";
      if (shares % 10 !== 0) return "Total shares must be divisible by 10.";
      return "";
    }

    if (field === "minInvestment") {
      if (isBlank(value)) return "Minimum shares per purchase is required.";
      const minInv = num(value);
      if (!Number.isFinite(minInv) || minInv <= 0)
        return "Enter a valid minimum shares (must be > 0).";

      const shares = num(all.sharesAvailable);
      if (Number.isFinite(shares) && shares > 0 && minInv > shares) {
        return "Minimum shares per purchase must be less than or equal to total shares.";
      }
      return "";
    }

    if (field === "pricePerShare") {
      if (isBlank(value)) return "Price per share is required.";
      const price = num(value);
      if (!Number.isFinite(price) || price <= 0)
        return "Enter a valid price per share (must be > 0).";
      return "";
    }

    if (field === "expirationDate") {
      if (!value) return "Expiration date is required.";
      if (!(value instanceof Date) || Number.isNaN(value.getTime()))
        return "Please select a valid expiration date.";

      const today = utcTodayMidnight();
      const expiry = toUtcMidnightDate(value);
      const diffInDays =
        (expiry.getTime() - today.getTime()) / (1000 * 3600 * 24);

      if (diffInDays < 30)
        return "Expiration date must be at least 30 days from today.";
      return "";
    }

    return "";
  };

  const validation = useMemo(() => {
    const all = { sharesAvailable, minInvestment, pricePerShare, expirationDate };
    return {
      sharesAvailable: validateField("sharesAvailable", sharesAvailable, all),
      minInvestment: validateField("minInvestment", minInvestment, all),
      pricePerShare: validateField("pricePerShare", pricePerShare, all),
      expirationDate: validateField("expirationDate", expirationDate, all),
    };
  }, [sharesAvailable, minInvestment, pricePerShare, expirationDate]);

  const isBusinessReady =
    Boolean(businessId) && status !== "loading" && status !== "idle";

  // ✅ Post Offer locked until everything is valid (like signup)
  const canPost =
    !submitting &&
    isBusinessReady &&
    !validation.sharesAvailable &&
    !validation.minInvestment &&
    !validation.pricePerShare &&
    !validation.expirationDate;

  const handlePost = async () => {
    try {
      if (!businessId) return;

      // show all errors if user tries to force a submit
      setTouched({
        sharesAvailable: true,
        minInvestment: true,
        pricePerShare: true,
        expirationDate: true,
      });

      // guard (button is disabled, but keep safety)
      const hasAnyError = Object.values(validation).some(Boolean);
      if (hasAnyError) return;

      setSubmitting(true);

      const shares = Number(sharesAvailable);
      const minInv = Number(minInvestment);
      const price = Number(pricePerShare);

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

      await refreshProtectedData();
      nav("/business-profile", { replace: true });
    } catch (error) {
      console.error("Error submitting:", error);
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

        <div className="field-wrap">
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
            onBlur={() => markTouched("sharesAvailable")}
            disabled={submitting}
          />
          {touched.sharesAvailable && validation.sharesAvailable && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {validation.sharesAvailable}
            </div>
          )}
        </div>

        <br />

        <div className="field-wrap">
          <div className="field-label">
            What is the minimum number of shares per purchase?
          </div>
          <input
            className="create-investment-input"
            type="number"
            value={minInvestment}
            min="1"
            inputMode="numeric"
            placeholder="0"
            onChange={(e) => setMinInvestment(e.target.value)}
            onBlur={() => markTouched("minInvestment")}
            disabled={submitting}
          />
          {touched.minInvestment && validation.minInvestment && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {validation.minInvestment}
            </div>
          )}
        </div>

        <br />

        <div className="field-wrap">
          <div className="field-label">What is the price per share in USD?</div>
          <input
            className="create-investment-input"
            type="number"
            value={pricePerShare}
            min="1"
            step="1"
            inputMode="numeric"
            placeholder="0"
            onChange={(e) => setPricePerShare(e.target.value)}
            onBlur={() => markTouched("pricePerShare")}
            disabled={submitting}
          />
          {touched.pricePerShare && validation.pricePerShare && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {validation.pricePerShare}
            </div>
          )}
        </div>

        <br />

        <div className="field-wrap">
          <div className="field-label">What is the expiration date?</div>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              value={expirationDate}
              onChange={(newValue) => setExpirationDate(newValue)}
              onClose={() => markTouched("expirationDate")}
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
                  onBlur: () => markTouched("expirationDate"),
                  disabled: submitting,
                },
              }}
            />
          </LocalizationProvider>

          {touched.expirationDate && validation.expirationDate && (
            <div className="custom-error-popup">
              <div className="error-arrow"></div>
              <div className="error-icon">!</div>
              {validation.expirationDate}
            </div>
          )}
        </div>

        <br />

        <div className="button-container-createinvestment">
          <button className="cancel-button" onClick={handleCancel} disabled={submitting}>
            Cancel
          </button>

          <button className="post-button" onClick={handlePost} disabled={!canPost}>
            {submitting ? "Posting..." : "Post Offer"}
          </button>
        </div>
      </div>
    </div>
  );
}
