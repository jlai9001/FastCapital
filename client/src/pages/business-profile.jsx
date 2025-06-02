import { useNavigate } from "react-router-dom";
import FinancialDashboard from "../components/financials_table";
import InvestmentCardsByBusinessId from "../components/investment-cards-by-businessID.jsx";
import { useBusinessForUser, useFinancialsForBusiness, useInvestmentsForBusiness } from "../hooks/getData.jsx";
import "./business-profile.css";

export default function BusinessProfile() {
    const navigate = useNavigate();
    const { business, loading, error } = useBusinessForUser();

    const {
      financials, loading: financialsLoading, error: financialsError
    } = useFinancialsForBusiness(business?.id);

    const {
      investments,
      loading: investmentsLoading,
      error: investmentsError,
    } = useInvestmentsForBusiness(business?.id);

    if (loading) return <h1> Loading... </h1>
    if (error) return <h1> {error.message} </h1>

    if (!business) {
    return (
      <div className="no-business-container">
          <h1>No Business Found</h1>
          <p>It looks like you haven't added a business profile yet.</p>
          <button onClick={() => navigate("/add-business")}>Add Your Business</button>
      </div>
  );
}

    return (
        <div className="business-profile-container">
            <h1 className="business-name">{business.name}</h1>
            <div className="business-info">
                <div className="business-image-container">
            <img
            src={business.image_url || "https://via.placeholder.com/150"}
            alt={business.name}
            className="business-image"
            />
            </div>
          <div className="business-details">
          <h3>{business.city}, {business.state}</h3>
          <h3><a href={business.website_url} target="_blank" rel="noopener noreferrer">{business.website_url}</a></h3>
          </div>
          </div>

          <div className="financial-dashboard-container">
            {financialsLoading ? (
              <h3>Loading Financials...</h3>
            ) : financialsError ? (
              <h2>Error loading financials: {financialsError.message}</h2>
            ) : financials && financials.length > 0 ? (
              <FinancialDashboard businessId={business.id} />
            ) : (
                <div className="no-financials-container">
                  <h2>No Financial Records Found</h2>
                  <p>Add financial data to see your business's performance dashboard.</p>
                  <button onClick={() => navigate("/add-financials")}>Add Financials</button>
        </div>
            )}
          </div>
        <div className="business-investment-container">
        <h2>Investment Offers</h2>

  {investmentsLoading && <p>Loading investments...</p>}
  {investmentsError && <p>Error loading investments.</p>}

  {!investmentsLoading && !investments && (
    <div className="no-investments-container">
      <h3>No Investment Offers Found</h3>
      <p>Add an investment offer to attract potential investors.</p>
      <button type="button" onClick={() => navigate("/add-investment")}>
        Add Investment Offer
      </button>
    </div>
  )}

  {!investmentsLoading && investments && (
    <>
      <InvestmentCardsByBusinessId businessId={business.id} />
      <button type="button" onClick={() => navigate("/add-investment")}>
        Add Investment Offer
      </button>
    </>
  )}
        </div>
        </div>
      );
    }
