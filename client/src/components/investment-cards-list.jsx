import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvestments, getBusinesses } from "../hooks/getData";
import "./investment-cards-list.css";


export default function InvestmentCardsList() {
    const [error, setError] = useState(null);
    const [investments, setInvestments] = useState([]);
    const [businesses, setBusinesses] = useState([]);
    const navigate = useNavigate();
    const [sortOption, setSortOption] = useState('');
    const [filterExpiring, setFilterExpiring] = useState(false);

    const handleSortChange = (e) => setSortOption(e.target.value);
    const handleFilterToggle = () => setFilterExpiring(prev => !prev);

// Sort and filter logic
const now = new Date();
const sevenDaysLater = new Date();
sevenDaysLater.setDate(now.getDate() + 7);

let filteredInvestments = [...investments];

// Filter
if (filterExpiring) {
  filteredInvestments = filteredInvestments.filter(inv => {
    const exp = new Date(inv.expiration_date);
    return exp >= now && exp <= sevenDaysLater;
  });
}

// Sort
if (sortOption === 'price') {
  filteredInvestments.sort((a, b) => a.price_per_share - b.price_per_share);
} else if (sortOption === 'min') {
  filteredInvestments.sort((a, b) => a.min_investment - b.min_investment);
}

    useEffect(() => {
        (async function fetchData() {
            const investmentsResult = await getInvestments();
            if (investmentsResult instanceof Error) {
                setError("Investments Not Found");
                return;
            }
            setInvestments(investmentsResult);

            const businessesResult = await getBusinesses();
            if (businessesResult instanceof Error) {
                setError("Businesses Not Found");
                return;
            }
            setBusinesses(businessesResult);
        })();
    }, []);

    if (error) return <h1>{error}</h1>;
    if (!investments.length || !businesses.length) return <h1>Loading...</h1>;

    const handleViewDetailsClick = (investmentId) => {
        navigate(`/investment/${investmentId}`); // Replace with actual route to Investment Detail page
    };

return (
    <div className="investment-list-container">
      <div className="investment-controls">
        <div className="sort-filter">
        <label>
                <input
                type="checkbox"
                checked={filterExpiring}
                onChange={handleFilterToggle}
                />
                Expires in next 7 days
            </label>
            <label>
                Sort by:
                <select onChange={handleSortChange}>
                <option value="">None</option>
                <option value="price">Price per Share (Low → High)</option>
                <option value="min">Minimum Investment (Low → High)</option>
                </select>
            </label>
        </div>
    </div>

    {filteredInvestments.length > 0 ? (
      <ul>
        {filteredInvestments.map((investment) => {
            const business = businesses.find(b => b.id === investment.business_id);
            if (!business) return null;

            // Placeholder calculations
            const shares_available = investment.shares_available - investment.shares_sold;

            return (
                <li key={investment.id} className="investment-card">
                    <div className="card-top">
                        <div className="business-name">
                            <h2>{business.name}</h2>
                        </div>
                        <div className="investment-details">
                            <p>Shares Available: {investment.shares_available}</p>
                            <p>Price per share: {investment.price_per_share}</p>
                            <p>Minimum shares for investment: {investment.min_investment}</p>
                        </div>
                    </div>
                    <div className="card-bottom">
                        <div className="business-details">
                            <p>Location: {business.city}, {business.state}</p>
                            <p>Website: {business.website}</p>
                            <p>Investment offer expires on: {investment.expiration_date}</p>
                        </div>
                        <div className="button-container">
                            <button onClick={() => handleViewDetailsClick(investment.id)}
                            className="view-details-button">View Details</button>
                        </div>
                    </div>
                </li>
            );
        })}
      </ul>
    ) : (
        <p className="no-results">No investments found matching your filters.</p>
    )}
  </div>
  );
}
