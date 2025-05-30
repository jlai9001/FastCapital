import React, { useEffect, useState } from "react";
import axios from "axios";
import './your-investments_chart.css';
import { PieChart } from "@mui/x-charts/PieChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const chartTheme = createTheme({
  components: {
    MuiChartsLegend: {
      styleOverrides: {
        root: {
          color: "#333", // Legend text
        },
      },
    },
    MuiChartsTooltip: {
      styleOverrides: {
        root: {
          color: "#333",
          backgroundColor: "#fff", // Optional for tooltip background
        },
      },
    },
    MuiChartsAxis: {
      styleOverrides: {
        tickLabel: {
          fill: "#333", // Axis labels if present
        },
      },
    },
  },
});



const InvestmentsCard = ({ investment }) => {
  const { business_name, shares_purchased, cost_per_share } = investment;
  const totalInvestment = shares_purchased * cost_per_share;
  return (
    <div className="investments-card">
      <div className="investments-header">
        <h2 className="investments-title">{business_name}</h2>
      </div>
      <div className="investments-details">
        <p><strong>Value:</strong> ${totalInvestment.toFixed(2)}</p>
      </div>
    </div>
  );
};

const UserInvestments = () => {
  const [investments, setInvestments] = useState([]);
  useEffect(() => {
    axios
      .get(`http://localhost:8000/api/purchases?status=completed`, {
      withCredentials: true
      })
      .then(res => {
        if (Array.isArray(res.data)) {
          setInvestments(res.data);
        } else {
          console.error("Unexpected response format:", res.data);
        }
      })
      .catch(err => console.error("Error fetching investments:", err));
    }, []);

  const pieData = Array.isArray(investments)
    ? Object.values(
        investments.reduce((acc, inv) => {
          const total = inv.shares_purchased * inv.cost_per_share;
          if (!acc[inv.business_name]) {
            acc[inv.business_name] = {
              id: inv.business_name,
              value: 0,
              label: inv.business_name,
              label: inv.business_name,
            };
          }
          acc[inv.business_name].value += total;
          return acc;
        }, {})
      )
    : [];

  const totalPortfolioValue = investments.reduce((sum, inv) => {
    return sum + inv.shares_purchased * inv.cost_per_share;
  }, 0);

  return (
    <ThemeProvider theme={chartTheme}>
    <div className="investments-dashboard">
      <div className="investments-chart">
        <h3>Investments by Business</h3>
        <PieChart
          series={[{
            data: pieData }]}
          width={300}
          height={300}
          legend={{ position: "right" }}
          sx={{
            '& .MuiChartsLegend-series': {
              color: '#fff'
            },
          }}
        />
      </div>
      <div className="investments-grid-wrapper">
        {investments.map((inv) => (
          <InvestmentsCard key={inv.id} investment={inv} />
        ))}
      <div className="portfolio-total">
        <h3>Total Portfolio Value: ${totalPortfolioValue.toFixed(2)}</h3>
      </div>
      </div>
    </div>
    </ThemeProvider>
  );}
;

export default UserInvestments;
