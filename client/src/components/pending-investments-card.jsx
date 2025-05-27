import { React, useState } from 'react'
import './pending-investments-card.css'
import { useNavigate } from 'react-router-dom';

// This function will need to recieve the data for a purchase by passing the prop into the component
export default function PendingInvestmentsCard({ purchase }){

    const navigate = useNavigate();
    const [details, setDetails] = useState(purchase)
    const [error, setError] = useState(null)

    if (error) {
        return <div className="pending-investment-card error">Error: Investment data could not be populated.</div>;
    }

    const handleViewDetails = () => {
        navigate(`/investment-details/${details.id}`) // TODO: Repalce with the ID details once defined
    }
    // TODO: Add fetch to the getPurchase route so that we can populate the pending investment's details


    return (
        // TODO: Replace with real data from the purchase
        <div className='pending-investment-card'>
            <div className='pending-investment-info'>
                <h3 className='pending-investment name'>
                    {details.name || "Bob's Coffee"}
                </h3>
                <span className='pending-investment location'>
                    {details.location || "Los Angeles, CA"}
                </span>
                <span className='pending-investment' id='percent-complete'>
                    {details.percentComplete || "10% of requested shares sold"}
                </span>
            </div>

            <div className="pending-investment-actions">
                <span className='pending-investment shares-bought'>
                    {details.sharesBought || "100 Shares"}
                </span>
                <button
                onClick={handleViewDetails}
                className='action-button view-details-button'>
                    View Details
                </button>
            </div>
        </div>
    );
}
