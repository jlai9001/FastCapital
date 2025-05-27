import React, {useEffect, useState} from "react";
import axios from "axios";
import '../components/your-investments_chart.css';
import { PieChart } from "@mui/x-charts/PieChart";

const InvestmentCard = ({ investment }) => {
    const {
        business_name,
        shares_purchased,
        cost_per_share,
    } = investment;

    const totalInvestment = shares_purchased * cost_per_share;

    return (
        <div className="investment-card">
            <div className="investment-header">
              <h2 className="investment-title">{business_name}</h2>
            </div>
            <div className="investment-details">
              <p><strong>Shares:</strong> {shares_purchased}</p>
              <p><strong>Cost/Share:</strong> ${cost_per_share.toFixed(2)}</p>
              <p><strong>Total:</strong> ${totalInvestment.toFixed(2)}</p>
            </div>
          </div>
      );
    };

    const UserInvestments = ({ userId }) => {
      const [investments, setInvestments] = useState([]);

      useEffect(() => {
        axios
          .get(`/api/purchases/${userId}?status=completed`)
          .then(res => setInvestments(res.data))
          .catch(err => console.error('Error fetching investments:', err));
      }, [userId]);

      const pieData = Object.values(
        investments.reduce((acc, inv) => {
          const total = inv.shares_purchased * inv.cost_per_share;
          if (!acc[inv.business_name]) {
            acc[inv.business_name] = {
              id: inv.business_name,
              value: 0,
              label: inv.business_name
            };
          }
          acc[inv.business_name].value += total;
          return acc;
        }, {})
      );

      return (
        <div className="investment-dashboard">
          <div className="investment-chart">
            <h3>Investment by Business</h3>
            <PieChart
              series={[{ data: pieData }]}
              width={300}
              height={300}
              legend={{ position: 'right' }}
            />
          </div>

          <div className="investment-grid-wrapper">
            {investments.map(inv => (
              <InvestmentCard key={inv.id} investment={inv} />
            ))}
          </div>
        </div>
      );
    };

    export default UserInvestments;
