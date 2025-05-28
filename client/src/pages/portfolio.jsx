import { useEffect, useState } from "react"
import PendingInvestmentsCard from '../components/pending-investments-card'


export default function Portfolio(){
  const [pendingPurchases, setPendingPurchases] = useState([]);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("");

  const user_id = 1

  useEffect (() => {
    const fetchPastPurchases = async () => {
      try {
        const result = await fetch(`http://localhost:8000/api/purchases/${user_id}?status=pending`)
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
  }, [user_id]);

    return(
        <>
            <section className="your-investments">
                <h2>Your Investments</h2>
                <UserInvestments />
            </section>
            <section className="pending-investments">
                <h2>Pending Investments</h2>
                {loading && <p>Loading pending investments...</p>}
                {error && <p>{error}</p>}

                {pendingPurchases.map((purchase) => (
                  <PendingInvestmentsCard
                  key={purchase.id}
                  purchase={purchase}
                />
                )
              )}
            </section>
        </>
    )
}
