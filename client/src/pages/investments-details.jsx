import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useOffer, useBusiness } from "../hooks/getData"; //feel free to look at these functions and reference (purchase.jsx) to see implementation or use your own


export default function InvestmentDetails() {
    const [error, setError] = useState(null);
    const [offer, setOffer] = useState(null);
    const [business, setBusiness] = useState(null);
    const { offerId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        (async function fetchData() {
            if (!offerId) {
                setError("No Offer Id");
                return;
            }

            const offerResult = await useOffer(offerId); // here
            if (offerResult instanceof Error) {
                setError("Offer Not Found");
                return;
            }
            setOffer(offerResult);

            const businessResult = await useBusiness(offer.business_id); // here
            if (businessResult instanceof Error) {
                setError("Business Not Found");
                return;
            }

            setBusiness(businessResult);
        })();
    }, [offerId]);

    if (error) return <h1>{error}</h1>;
    if (!offer || !business) return <h1>Loading...</h1>;

    const handleInvestNowClick = () => {
        navigate(`/${offerId}`); // Replace with actual route to Offer Purchase page
    };

    // Placeholder calculations
    const shares_available = offer.shares_available - offer.shares_sold;
    const number_of_investors = offer.investors.length; //needs adjustment

return (
    <div className="offer-details-container">
      <h2>Business Name: {business.name}</h2>
      <h3>Location: {business.city}, {business.state}</h3>
      <h3>Website: {business.website}</h3>
      <h3>Total Shares Offered: {offer.shares_available}</h3>
      <h3>Shares Available: {shares_available}</h3>
      <h3>Price per share: {offer.price_per_share}</h3>
      <h3>Minimum shares for investment: {offer.min_investment}</h3>
      <h3>Current number of investors: {number_of_investors}</h3>
      <h3>Offer expires on: {offer.expiration_date}</h3>
    <div className="button-container">
    <button onClick={handleInvestNowClick} className="invest-now-button">Invest Now!</button>
    </div>
  </div>
  );
};
