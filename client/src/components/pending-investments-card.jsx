import { React, useState } from 'react'
import './pending-investments-card.css'
import { useNavigate } from 'react-router-dom';

// This function will need to recieve the data for a purchase by passing the prop into the component
export default function PendingInvestmentsCard({ purchase }){
    const navigate = useNavigate();
    const [error, setError] = useState(null)

    if (error) {
        return <div className="pending-investment-card error">Error: Investment data could not be populated.</div>;
    }

    const handleViewDetails = () => {
        navigate(`/investment-details/${purchase.id}`) // TODO: Repalce with the ID details once defined
    };


    return (
        // TODO: Replace with real data from the purchase
        <div className='pending-investment-card'>
            <div className='pending-investment-info'>
                <h3 className='pending-investment name'>
                    {purchase.business_name || "No business name provided"}
                </h3>
                <span className='pending-investment location'>
                    {purchase.business_city || "No city provided"},
                    {purchase.business_state || "No state provided"}
                </span>
                <span className='pending-investment-info' id='percent-complete'>
                    {purchase.percentComplete || "10% of requested shares sold"}
                </span>
            </div>

            <div className="pending-investment-actions">
                <span className='pending-investment shares-bought'>
                    {purchase.shares_purchased || "100 Shares"} Shares
                </span>
                <button
                onClick={handleViewDetails}
                className='action-button view-details-button'>
                    Details
                </button>
            </div>
        </div>
    );
}
