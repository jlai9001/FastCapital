import { useEffect, useState } from "react";
import { getBusinesses } from "../hooks/getData";
import InvestmentCard from "./investment-card";
import "./investment-cards-list.css";
import { Switch } from "@mui/material";
import { base_url } from "../api";

export default function InvestmentCardsList() {
  const [businesses, setBusinesses] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [sortOption, setSortOption] = useState("");
  const [filterExpiring, setFilterExpiring] = useState(false);

  const handleSortChange = (e) => setSortOption(e.target.value);
  const handleFilterToggle = () => setFilterExpiring((prev) => !prev);

  useEffect(() => {
    let cancelled = false;

    (async function fetchData() {
      try {
        setLoading(true);
        setError("");

        // ✅ Only fetch ACTIVE offers from the server
        const investmentsRes = await fetch(
          `${base_url}/api/investment?active=true`,
          {
            credentials: "include",
          }
        );

        if (!investmentsRes.ok) throw new Error("Investments Not Found");
        const investmentsData = await investmentsRes.json();

        const businessesResult = await getBusinesses();
        if (businessesResult instanceof Error)
          throw new Error("Businesses Not Found");

        if (cancelled) return;

        setInvestments(Array.isArray(investmentsData) ? investmentsData : []);
        setBusinesses(Array.isArray(businessesResult) ? businessesResult : []);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
        setError(err?.message || "Failed to load investments");
        setInvestments([]);
        setBusinesses([]);
      } finally {
        if (cancelled) return;
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ---------- derived list ----------
  const now = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(now.getDate() + 7);

  // ✅ Extra defense: hide sold-out offers (should already be filtered by active=true)
  let filteredInvestments = [...investments].filter((inv) => {
    const sharesLeft = Number(inv?.shares_available);
    if (!Number.isFinite(sharesLeft)) return true; // don't hide if missing
    return sharesLeft > 0;
  });

  if (filterExpiring) {
    filteredInvestments = filteredInvestments.filter((inv) => {
      const exp = new Date(inv.expiration_date);
      if (Number.isNaN(exp.getTime())) return false;
      return exp >= now && exp <= sevenDaysLater;
    });
  }

  if (sortOption === "price_asc") {
    filteredInvestments.sort(
      (a, b) => Number(a.price_per_share) - Number(b.price_per_share)
    );
  } else if (sortOption === "price_desc") {
    filteredInvestments.sort(
      (a, b) => Number(b.price_per_share) - Number(a.price_per_share)
    );
  } else if (sortOption === "min_asc") {
    filteredInvestments.sort(
      (a, b) => Number(a.min_investment) - Number(b.min_investment)
    );
  } else if (sortOption === "min_desc") {
    filteredInvestments.sort(
      (a, b) => Number(b.min_investment) - Number(a.min_investment)
    );
  }

  // ---------- UI states ----------
  if (loading) return <h1>Loading...</h1>;
  if (error) return <h1>{error}</h1>;

  const noActiveInvestments = investments.length === 0;

  return (
    <div className="investment-list-container">
      <div className="investment-controls">
        <div className="sort-filter">
          <div className="invest-opp-title">Investment Opportunities</div>

          {/* ✅ NEW: layout wrapper so CSS can align controls nicely */}
          <div className="controls-row">
            <label className="switch-element">
              <Switch
                className="expires-switch"
                checked={filterExpiring}
                onChange={handleFilterToggle}
              />
              <span className="switch-label">Expires soon</span>
            </label>

            <label className="sort-group">
              <span className="sort-label">Sort By:</span>
              <select
                className="sort-select"
                onChange={handleSortChange}
                value={sortOption}
              >
                <option value="">Property</option>

                <option value="price_asc">Price per Share (Low → High)</option>
                <option value="price_desc">Price per Share (High → Low)</option>

                <option value="min_asc">Minimum Investment (Low → High)</option>
                <option value="min_desc">Minimum Investment (High → Low)</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      {noActiveInvestments ? (
        <p className="no-results">No active investments available right now.</p>
      ) : filteredInvestments.length > 0 ? (
        <ul className="card-grid">
          {filteredInvestments.map((investment) => {
            const matchedBusiness = businesses.find(
              (b) => b.id === investment.business_id
            );

            return (
              <li key={investment.id} className="investment-card-wrapper">
                <InvestmentCard investment={investment} business={matchedBusiness} />
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="no-results">No investments found matching your filters.</p>
      )}
    </div>
  );
}
