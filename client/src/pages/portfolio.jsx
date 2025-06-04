import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom";
import PendingInvestmentsCard from '../components/pending-investments-card'
import UserInvestments from "../components/your-investments_chart";
import './portfolio.css';

export default function Portfolio(){
  const [user, setUser] = useState(null);
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/me", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Not authenticated");

        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        navigate("/login"); // Redirect to login if not authenticated
      }
    };

    fetchUser();
  }, []);

  useEffect (() => {
    if (!user) return;

    const fetchPastPurchases = async () => {
      try {
        const result = await fetch(`http://localhost:8000/api/purchases?status=pending`,
          { credentials: "include" }
        );
        if(!result.ok) throw new Error("Failed to fetch past purchases");

        const data = await result.json();
        setPendingPurchases(data)
      } catch (error) {
        setError("Could not load past purchases.");
      } finally {
        setLoading(false)
      }
    };
    fetchPastPurchases();
  }, [user]);

    return(
      <div className="portfolio-page-container">
         <h2>Investment Portfolio</h2>
        <div className="your-investments-container">
              <UserInvestments user={user} />
          </div>
          <div className="pending-investments-container">
          <p className="pending-investments-title">Pending Investments</p>
              {loading && <p>Loading pending investments...</p>}
              {error && <p>{error}</p>}

              {pendingPurchases.map((purchase) => (
                <PendingInvestmentsCard
                key={purchase.id}
                purchase={purchase}
              />
              )
            )}
          </div>
      </div>
    )
}
