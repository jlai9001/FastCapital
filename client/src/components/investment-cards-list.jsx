import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getInvestments } from "../hooks/getData";
import InvestmentCard from "./investment-card";
import "./investment-cards-list.css";

export default function InvestmentCardsList() {
    const [error, setError] = useState(null);
    const [investments, setInvestments] = useState([]);
    const navigate = useNavigate();
    const [sortOption, setSortOption] = useState('');
    const [filterExpiring, setFilterExpiring] = useState(false);

    const handleSortChange = (e) => setSortOption(e.target.value);
    const handleFilterToggle = () => setFilterExpiring(prev => !prev);

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
        })();
    }, []);

    if (error) return <h1>{error}</h1>;
    if (!investments.length) return <h1>Loading...</h1>;

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
            <ul className="card-grid">
            {filteredInvestments.map((investment) => (
                <li key={investment.id} className="investment-card-wrapper">
                <InvestmentCard investment={investment} />
                </li>
            ))}
            </ul>
        ) : (
            <p className="no-results">No investments found matching your filters.</p>
        )}
        </div>
    );
    }
