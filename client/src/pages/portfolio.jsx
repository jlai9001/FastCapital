import PendingInvestmentsCard from "../components/pending-investments-card";
import UserInvestments from "../components/your-investments_chart";
import "./portfolio.css";
import { useState } from "react";
import { base_url } from "../api";
import { useProtectedData } from "../context/protected-data-provider.jsx";

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Portfolio() {
  const { status, purchasesPending, pendingInvestments } = useProtectedData();

  // Leave this for now so your chart prop doesn't explode.
  // Next step we’ll make UserInvestments use cached data properly.
  const [user] = useState(null);

  const loading = status === "loading" || status === "idle";
  const error = status === "error";

  return (
    <div className="portfolio-page">
      <main className="portfolio-page-container">
        <h2>Investment Portfolio</h2>

        <div className="your-investments-container">
          <UserInvestments user={user} />
        </div>

        <div className="pending-investments-container">
          <p className="pending-investments-title">Pending Investments</p>

          {loading && <p>Loading pending investments...</p>}
          {error && <p>Could not load portfolio data.</p>}

          {!loading && !error && purchasesPending.length === 0 && (
            <p className="empty-pending">Please purchase an investment.</p>
          )}

          {purchasesPending.map((purchase) => {
            const matchingInvestment = pendingInvestments.find(
              (inv) => inv?.id === purchase.investment_id
            );

            return (
              <PendingInvestmentsCard
                key={purchase.id}
                purchase={purchase}
                investment={matchingInvestment}
              />
            );
          })}
        </div>
      </main>
    </div>
  );
}
