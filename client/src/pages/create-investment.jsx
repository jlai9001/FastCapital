import './create-investment.css';

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base_url } from '../api'
import { useBusinessForUser } from "../hooks/getData";

export default function NewInvestment() {
    const [sharesAvailable, setSharesAvailable] = useState(0);
    const [pricePerShare, setPricePerShare] = useState(0);
    const [minInvestment, setMinInvestment] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const {business} = useBusinessForUser();

    const nav = useNavigate();
    const businessId = business?.id;


    const handlePost = async () => {
        try {
            // business ID guard
            if (!businessId) {
                alert("Business not loaded yet. Please wait and try again.");
                return;
            }
            setSubmitting(true);

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
                start_date: new Date().toISOString().split("T")[0],
                expiration_date: expirationDate
            });

            const response = await fetch(`${base_url}/api/investment`, {
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
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        nav(-1);
    };

    return (
        <div className='create-investment-container'>
            <div className="create-investment-form">
                <div className="title">Create Investment</div>
                <div>
                    <div className="field-label">How many shares would you like to sell?</div>
                    <input
                        type="number"
                        value={sharesAvailable}
                        min="100"
                        step="100"
                        onChange={(e) => setSharesAvailable(Number(e.target.value))}
                    />
                </div><br />
                <div>
                    <div className="field-label">What is the minimum investment you need?</div>
                    <input
                        type="number"
                        value={minInvestment}
                        min="1"
                        onChange={(e) => setMinInvestment(Number(e.target.value))}
                    />
                </div><br />
                    <div className="field-label">What is the price per share in USD?</div>


                <div >
                    <input
                        type="number"
                        value={pricePerShare}
                        min="1"
                        step="1"
                        onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setPricePerShare(isNaN(val) ? 0 : val);
                        }}
                    />
                </div><br />
                <div>
                    <div className="field-label">What is the expiration date?</div>
                    <input
                        type="date"
                        value={expirationDate}
                        onChange={(e) => setExpirationDate(e.target.value)}
                    />
                </div><br />
                <div className="button-container">
                    <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                    <button className="post-button"
                        onClick={handlePost}
                        disabled={!business || submitting}>
                            {submitting ? "Posting..." : "Post Offer"}
                    </button>
                </div>
            </div>

        </div>
    );
}
