import React, { useEffect, useState } from "react";
import axios from "axios";
import './your-investments_chart.css';
import { PieChart } from "@mui/x-charts/PieChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import businessPlaceholder from "../assets/business_placeholder.png";

const chartTheme = createTheme({
  components: {
    MuiChartsSurface: {
      styleOverrides: {
        root: {
          height: 200, // Adjust height as needed
        },
      },
    },
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
  const {
    business_name,
    shares_purchased,
    cost_per_share,
    business_image_url
   } = investment;

  const totalInvestment = shares_purchased * cost_per_share;

  return (
    <div className="investments-card">
      <div className="investments-row">
        <div className="investments-left">
          <img
            src={business_image_url && business_image_url.trim() !== "" ? business_image_url : businessPlaceholder}
            alt={business_name}
            className="investment-business-image"
          />
        <p className="investments-title">{business_name}</p>
      </div>
      <p className="investment-amount"> ${totalInvestment.toFixed(2)}</p>
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
    <div className="investments-dashboard-container">
      <div className="investments-dashboard-header">
      <p>Your Investments</p>
      </div>
      <div className="investments-dashboard">
      <div className="investments-chart">
        <p className="portfolio-title">Your Portfolio</p>
        <div className="piechart-wrapper">
        <PieChart
          series={[{
            data: pieData }]}
          width={300}
          height={300}
          legend={{ position: "right" }}
          sx={{
            '& .MuiChartsLegend-series': {
              color: '#374151'
            },
          }}
        />
      </div>
      </div>
      <div className="investments-grid-wrapper">
        {investments.map((inv) => (
          <InvestmentsCard key={inv.id} investment={inv} />
        ))}
      <div className="portfolio-total">
        <p><span className="value-text">Total Value: &nbsp;  </span><span className="value">${totalPortfolioValue.toFixed(2)}</span></p>
      </div>
      </div>
    </div>
    </div>
    </ThemeProvider>
  );}
;

export default UserInvestments;
