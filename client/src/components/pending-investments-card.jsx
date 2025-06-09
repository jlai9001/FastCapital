import { React, useState } from 'react'
import './pending-investments-card.css'
import { useNavigate } from 'react-router-dom';
import mapIcon from '../assets/map_icon.png';

// This function will need to recieve the data for a purchase by passing the prop into the component
export default function PendingInvestmentsCard({ purchase, investment }){
    const navigate = useNavigate();
    const [error, setError] = useState(null)

    if (error) {
        return <div className="pending-investment-card error">Error: Investment data could not be populated.</div>;
    }

    const handleViewDetails = () => {
        navigate(`/investment-details/${investment.id}`)
    };

    const percentSold = investment && investment.shares_available
        ? Math.round((purchase.shares_purchased / investment.shares_available) * 100)
        : 0;

    return (
        <div className='pending-investment-card'>
            <div className='pending-investment-left'>
                <p className='pending-investment-name'>
                    {purchase.business_name || "No business name provided"}
                </p>
                <p className='pending-investment-location'>
                <img
              src={mapIcon}
              alt="Map Icon"
              className='map-icon'
            />
            &nbsp;
            {purchase.business_city + ", " + purchase.business_state}
                </p>
            </div>
                <div className='pending-investment-right'>
                    <div className='pending-info-column1'>
                        <div className='pending-info-label'>Shares Purchased</div>
                        <div className='pending-info-value'>{purchase.shares_purchased}</div>
                    </div>
            <div className='pending-info-column2'>
            <p className='pending-info-label'>Funded</p>
            <div className="pending-investment-progress-bar-wrapper">
                <div className="pending-investment-progress-bar-row">
                    <div className="pending-investment-progress-bar">
                        <div className="progress-fill" style={{ width: `${percentSold}%` }}></div>
                    </div>
                    <p className="funded-percentage">{percentSold}%</p>
                </div>
            </div>
            </div>
            <div className='pending-info-column3'>
                <button
                onClick={handleViewDetails}
                className='action-button view-all-button'>
                    View Details
                </button>
            </div>
        </div>
    </div>
    );
}
