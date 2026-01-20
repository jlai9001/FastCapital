import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import "./financials_table.css";

function FinancialDashboard({ financials = [] }) {
  const [tab, setTab] = useState("pl");
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


  const calcChartWidth = () => {
  const w = window.innerWidth;
  return Math.max(280, Math.min(420, w - 48));
  };

  const [chartWidth, setChartWidth] = useState(calcChartWidth());


  /* -----------------------------
     Mobile detection
  ----------------------------- */

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setChartWidth(calcChartWidth());
    };

    handleResize(); // run once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  /* -----------------------------
     Persistent Y-axis config
  ----------------------------- */
  const yAxisConfig = [
    {
      id: "y-axis",
      scaleType: "linear",
      min: 0,
      max: undefined,
    },
  ];

  /* -----------------------------
     Fetch financial data
  ----------------------------- */

  useEffect(() => {
  const data = Array.isArray(financials) ? financials : [];

  const yearSet = new Set(data.map((f) => new Date(f.date).getFullYear()));
  const sortedYears = Array.from(yearSet).sort((a, b) => b - a);

  setYears(sortedYears);

  // If selectedYear is empty OR no longer exists, default to latest year
  if (sortedYears.length) {
    setSelectedYear((prev) => (prev && sortedYears.includes(prev) ? prev : sortedYears[0]));
  } else {
    setSelectedYear("");
  }
  }, [financials]);

  /* -----------------------------
     Aggregate monthly data
  ----------------------------- */
  const getMonthlyData = (typeKeys) => {
    const monthly = Array(12)
      .fill(0)
      .map(() => ({}));

    financials
      .filter((f) => new Date(f.date).getFullYear() === selectedYear)
      .forEach((f) => {
        const month = new Date(f.date).getMonth();
        const key = f.type.toLowerCase();

        if (typeKeys.includes(key)) {
          monthly[month][key] =
            (monthly[month][key] || 0) + f.amount;
        }
      });

    return monthly.map((entry) =>
      typeKeys.map((key) => entry[key] || 0)
    );
  };

  /* -----------------------------
     Render chart
  ----------------------------- */
  const renderChart = () => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    if (tab === "pl") {
      const [incomes, expenses] = getMonthlyData([
        "income",
        "expense",
      ]).reduce(
        ([rev, exp], [r, e]) => [
          [...rev, r],
          [...exp, e],
        ],
        [[], []]
      );

      const netIncome = incomes.map(
        (r, i) => r - expenses[i]
      );

      return (
        <BarChart
          xAxis={[{ scaleType: "band", data: months }]}
          yAxis={yAxisConfig}
          series={[
            { label: "Income", data: incomes, yAxisKey: "y-axis" },
            { label: "Expenses", data: expenses, yAxisKey: "y-axis" },
            { label: "Net Income", data: netIncome, yAxisKey: "y-axis" },
          ]}
            width={isMobile ? chartWidth : 700}
            height={isMobile ? 200 : 400}
        />
      );
    }

    if (tab === "bs") {
      const monthlyData = getMonthlyData([
        "asset",
        "liability",
      ]);
      const assets = monthlyData.map(([a]) => a);
      const liabilities = monthlyData.map(([, l]) => l);
      const equity = assets.map(
        (a, i) => a - liabilities[i]
      );

      return (
        <BarChart
          xAxis={[{ scaleType: "band", data: months }]}
          yAxis={yAxisConfig}
          series={[
            { label: "Assets", data: assets, yAxisKey: "y-axis" },
            { label: "Liabilities", data: liabilities, yAxisKey: "y-axis" },
            { label: "Equity", data: equity, yAxisKey: "y-axis" },
          ]}
          width={isMobile ? chartWidth : 700}
          height={isMobile ? 200 : 400}
        />
      );
    }

    return null;
  };

  /* -----------------------------
     UI blocks
  ----------------------------- */
  const TabsBlock = (
    <div className="financial-dashboard-tabs">
      <div className="tab-slider">
        <button
          className={`tab-button ${tab === "pl" ? "active" : ""}`}
          onClick={() => setTab("pl")}
        >
          Income Statement
        </button>
        <button
          className={`tab-button ${tab === "bs" ? "active" : ""}`}
          onClick={() => setTab("bs")}
        >
          Balance Sheet
        </button>
        <div
          className="tab-indicator"
          style={{
            transform:
              tab === "bs"
                ? "translateX(calc(100% + 4px))"
                : "translateX(0px)",
          }}
        />
      </div>
    </div>
  );

  const YearSelectorBlock = (
    <div className="financial-dashboard-dropdown">
      <select
        className="year-dropdown"
        value={selectedYear || ""}
        onChange={(e) =>
          setSelectedYear(Number(e.target.value))
        }
        aria-label="Select year"
      >
        <option value="" disabled>
          Year
        </option>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );

  const ChartBlock = (
    <div className="chart-render">
      {selectedYear && renderChart()}
    </div>
  );

  /* -----------------------------
     Render
  ----------------------------- */
  return (
    <div className="financial-dashboard">
      {isMobile ? (
        <>
          {YearSelectorBlock}
          {TabsBlock}
          {ChartBlock}
        </>
      ) : (
        <>
          <div className="dashboard-controls">
            {TabsBlock}
            {YearSelectorBlock}
          </div>
          {ChartBlock}
        </>
      )}
    </div>
  );
}

export default FinancialDashboard;
