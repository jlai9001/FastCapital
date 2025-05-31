import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewInvestment() {
    const [sharesAvailable, setSharesAvailable] = useState(0);
    const [pricePerShare, setPricePerShare] = useState(0);
    const [minInvestment, setMinInvestment] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");

    const nav = useNavigate();
    const businessId = 1; // TODO: make dynamic

    const handlePost = async () => {
        try {

            //this provides some input validation
            const validate = () => {
                if (sharesAvailable % 100 != 0){
                    alert("Available shares must be divisible by 100.")
                    throw new Error("Avaliable shares is invalid")}
                if (minInvestment > sharesAvailable){
                    alert("Minimum shares invested must be less than shares available.")
                    throw new Error("Minimum shares is invalid.")}



                const today = new Date();
                const expiry = new Date(expirationDate); // Parse from string
                const diffInTime = expiry.getTime() - today.getTime();
                const diffInDays = diffInTime / (1000 * 3600 * 24);
                if (diffInDays < 30) {
                    alert("Expiration date must be at least 30 days from today.");
                    throw new Error("Invalid expiration date.");
                }

            }; validate()


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
                        min="100"
                        step="100"
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
                <div style={{ position: "relative", display: "inline-block" }}> {/* this div was made with AI */}
                    <span style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "#555"
                    }}>$</span>
                    <input
                        type="number"
                        value={pricePerShare}
                        min="1"
                        step="1"
                        style={{
                        paddingLeft: "20px",
                        height: "30px"
                        }}
                        onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setPricePerShare(isNaN(val) ? 0 : val);
                        }}
                    />
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
