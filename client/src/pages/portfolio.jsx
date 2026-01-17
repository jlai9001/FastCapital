import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PendingInvestmentsCard from "../components/pending-investments-card";
import UserInvestments from "../components/your-investments_chart";
import "./portfolio.css";
import { base_url } from "../api";

function getAccessToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  const token = getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function Portfolio() {
  const [user, setUser] = useState(null);
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${base_url}/api/me`, {
          credentials: "include",
          headers: authHeaders(),
        });

        if (!res.ok) throw new Error("Not authenticated");

        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchPurchasesAndInvestments = async () => {
      try {
        setError("");

        const res = await fetch(`${base_url}/api/purchases?status=pending`, {
          credentials: "include",
          headers: authHeaders(),
        });

        if (!res.ok) throw new Error("Failed to fetch purchases");

        const purchaseData = await res.json();
        setPendingPurchases(purchaseData);

        const investmentIds = purchaseData.map((p) => p.investment_id);

        const investmentResults = await Promise.all(
          investmentIds.map((id) =>
            fetch(`${base_url}/api/investment/${id}`, {
              credentials: "include",
              headers: authHeaders(),
            }).then((res) => (res.ok ? res.json() : null))
          )
        );

        const validInvestments = investmentResults.filter(Boolean);
        setInvestments(validInvestments);
      } catch (error) {
        setError("Could not load purchases or investments.");
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasesAndInvestments();
  }, [user]);

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
          {error && <p>{error}</p>}

          {!loading && !error && pendingPurchases.length === 0 && (
            <p className="empty-pending">Please purchase an investment.</p>
          )}

          {pendingPurchases.map((purchase) => {
            const matchingInvestment = investments.find(
              (inv) => inv.id === purchase.investment_id
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
