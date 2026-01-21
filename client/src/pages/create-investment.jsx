import './create-investment.css';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client.js";
import { useProtectedData } from "../context/protected-data-provider.jsx";
import { useUser } from "../context/user-provider.jsx";


export default function NewInvestment() {
    const [sharesAvailable, setSharesAvailable] = useState(0);
    const [pricePerShare, setPricePerShare] = useState(0);
    const [minInvestment, setMinInvestment] = useState(0);
    const [expirationDate, setExpirationDate] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const { myBusiness, refreshProtectedData, status } = useProtectedData();
    const business = myBusiness;
    const { user } = useUser();


    const nav = useNavigate();
    const businessId = business?.id;

    useEffect(() => {
    const ensureAuthed = () => {
        const token = localStorage.getItem("access_token");

        // If token was deleted/expired, or user got cleared via fc:logout
        if (!token || !user) {
        nav("/login", { replace: true });
        }
    };

    // Run immediately on mount
    ensureAuthed();

    // If apiFetch triggers global logout, react instantly
    const onLogout = () => nav("/login", { replace: true });

    window.addEventListener("fc:logout", onLogout);

    // Manual deletion won't fire events — so re-check on user interaction/focus
    window.addEventListener("focus", ensureAuthed);
    document.addEventListener("click", ensureAuthed, true);

    return () => {
        window.removeEventListener("fc:logout", onLogout);
        window.removeEventListener("focus", ensureAuthed);
        document.removeEventListener("click", ensureAuthed, true);
    };
    }, [user, nav]);


    const handlePost = async () => {
        try {
            // business ID guard
            if (!businessId) {
            if (status === "loading" || status === "idle") {
                alert("Business is still loading. Please wait and try again.");
            } else {
                alert("No business found. Please create a business profile first.");
            }
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
                if (!expirationDate) {
                alert("Please choose an expiration date.");
                throw new Error("Missing expiration date.");
                }

                const today = new Date();
                const expiry = new Date(`${expirationDate}T00:00:00.000Z`);
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

            // ✅ ISO datetime expected by backend
            start_date: new Date().toISOString(),

            // ✅ Convert date-only input into a stable ISO datetime (UTC midnight)
            expiration_date: `${expirationDate}T00:00:00.000Z`,
            });


            const response = await apiFetch(`/api/investment`, {
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
            await refreshProtectedData();
            nav(-1);
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
                    <div className="field-label">How many shares are you offering in total?</div>
                    <input
                        type="number"
                        value={sharesAvailable}
                        min="1"
                        step="100"
                        onChange={(e) => setSharesAvailable(Number(e.target.value))}
                    />
                </div><br />
                <div>
                    <div className="field-label">What is the minimum number of shares per purchase?</div>
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
                        disabled={submitting || status === "loading" || status === "idle" || !business}>
                            {submitting ? "Posting..." : "Post Offer"}
                    </button>
                </div>
            </div>

        </div>
    );
}
