import { useParams, useNavigate } from "react-router-dom";
import { useInvestment, useBusiness } from "../hooks/getData";
import FinancialDashboard from "../components/financials_table";

export default function InvestmentDetails() {
    const { investmentId } = useParams();
    const navigate = useNavigate();

    const {
        loading: investmentLoading,
        error: investmentError,
        data: investment,
    } = useInvestment(investmentId)

    const {
        loading: businessLoading,
        error: businessError,
        data: business,
    } = useBusiness(investment?.business_id)

    if (investmentLoading || businessLoading) return <h1> Loading... </h1>
    if (investmentError || businessError) return <h1> {investmentError || businessError} </h1>
    if (!investment || !business) return <h1>Unable to retreive investment data.</h1>

    const shares_available = investment.shares_available - (investment.shares_sold || 0)
    const number_of_investors = investment.investors?.length || 0;

    const handlePurchaseClick = () => {
        navigate (`/investment-details/${investment.id}/purchase`);
    };

    return (
        <div className="offer-details-container">
          <h2>Business Name: {business.name}</h2>
          <h3>Location: {business.city}, {business.state}</h3>
          <h3>Website: {business.website}</h3>
          <h3>Total Shares Offered: {investment.shares_available}</h3>
          <h3>Shares Available: {shares_available}</h3>
          <h3>Price per share: ${investment.price_per_share}</h3>
          <h3>Minimum shares for investment: {investment.min_investment}</h3>
          <h3>Current number of investors: {number_of_investors}</h3>
          <h3>Offer expires on: {new Date(investment.expiration_date).toLocaleDateString()}</h3>
          <div className="button-container">
            <button onClick={handlePurchaseClick} className="invest-now-button">
              Invest Now!
            </button>
          </div>
          {business?.id && <FinancialDashboard businessId={business.id} />}
        </div>
      );
    }
