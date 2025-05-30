import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewInvestment() {
    const [sharesAvailable, setSharesAvailable] = useState(0);
    const [pricePerShare, setPricePerShare] = useState("");
    const [minInvestment, setMinInvestment] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");

    const nav = useNavigate();
    const businessId = 1; // TODO: make dynamic

    const handlePost = async () => { // TODO: check validation
        try {

            const headers = { "Content-Type": "application/json" };
            const body = JSON.stringify({
                business_id: businessId,
                shares_available: sharesAvailable,
                price_per_share: pricePerShare,
                min_investment: minInvestment,
                start_date: new Date().toISOString(),
                expiration_date: expirationDate
            });

            const response = await fetch(`http://localhost:8000/api/investment`, {
                method: "POST",
                headers,
                body
            });

            if (!response.ok) {
                const errorDetails = await response.json();
                console.error("Detailed Error response:", errorDetails);
                throw new Error("Offer request failed.");
            }

            const data = await response.json();
            console.log("Offer submitted:", data);
            alert("Investment offer submitted successfully!");
            nav(-1)
        } catch (error) {
            console.error("Error submitting:", error);
            alert("Failed to submit, please try again.");
        }
    };

    const handleCancel = () => {
        nav(-1);
    };

    return (
        <>
            <h2>Create Investment</h2>
            <section>
                <div>
                    <label>How many shares would you like to sell?</label><br />
                    <input
                        type="number"
                        value={sharesAvailable}
                        min="1"
                        onChange={(e) => setSharesAvailable(Number(e.target.value))}
                    />
                </div><br />
                <div>
                    <label>What is the minimum investment required?</label><br />
                    <input
                        type="number"
                        value={minInvestment}
                        min="1"
                        onChange={(e) => setMinInvestment(Number(e.target.value))}
                    />
                </div><br />
                <div>
                    <label>What is the price per share?</label><br />
                    <p>$<input
                        type="number"
                        value={pricePerShare}
                        min="0.01"
                        step="0.01"
                        onChange={(e) => setPricePerShare(e.target.value)}
                    /></p>
                </div><br />
                <div>
                    <label>What is the expiration date?</label><br />
                    <input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                    />
                </div><br />
            </section><br />
            <button onClick={handleCancel}>Cancel</button>
            <button onClick={handlePost}>Post Offer</button>
        </>
    );
}
