import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import "./financials_table.css";

/**
 * Supports:
 * - "YYYY-MM-DD" (and "YYYY-MM-DDTHH:MM...")
 * - "MM/YYYY"
 * - fallback to Date parsing if possible
 */
function parseFinancialDate(dateVal) {
  if (!dateVal) return null;

  const str = typeof dateVal === "string" ? dateVal.trim() : String(dateVal);

  // MM/YYYY
  const mmYYYY = str.match(/^(\d{1,2})\/(\d{4})$/);
  if (mmYYYY) {
    const month = Number(mmYYYY[1]);
    const year = Number(mmYYYY[2]);
    if (month >= 1 && month <= 12 && Number.isFinite(year)) {
      return { year, monthIndex: month - 1 };
    }
  }

  // ISO: YYYY-MM-DD (or YYYY-MM-DDTHH:MM:SS...)
  const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    if (month >= 1 && month <= 12 && Number.isFinite(year)) {
      return { year, monthIndex: month - 1 };
    }
  }

  // Fallback
  const d = new Date(str);
  if (!Number.isNaN(d.getTime())) {
    return { year: d.getFullYear(), monthIndex: d.getMonth() };
  }

  return null;
}

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
     Build year list from financials (SAFE parsing)
  ----------------------------- */
  useEffect(() => {
    const data = Array.isArray(financials) ? financials : [];

    const yearSet = new Set(
      data
        .map((f) => parseFinancialDate(f.date)?.year)
        .filter((y) => Number.isFinite(y))
    );

    const sortedYears = Array.from(yearSet).sort((a, b) => b - a);

    setYears(sortedYears);

    // If selectedYear is empty OR no longer exists, default to latest year
    if (sortedYears.length) {
      setSelectedYear((prev) =>
        prev && sortedYears.includes(prev) ? prev : sortedYears[0]
      );
    } else {
      setSelectedYear("");
    }
  }, [financials]);

  /* -----------------------------
     Aggregate monthly data (SAFE parsing)
  ----------------------------- */
  const getMonthlyData = (typeKeys) => {
    const monthly = Array(12)
      .fill(0)
      .map(() => ({}));

    financials.forEach((f) => {
      const parsed = parseFinancialDate(f.date);
      if (!parsed) return;
      if (parsed.year !== selectedYear) return;

      const month = parsed.monthIndex;
      const key = String(f.type || "").toLowerCase();

      if (!typeKeys.includes(key)) return;

      const amt = Number(f.amount || 0);
      monthly[month][key] = (monthly[month][key] || 0) + (Number.isFinite(amt) ? amt : 0);
    });

    return monthly.map((entry) => typeKeys.map((key) => entry[key] || 0));
  };

  /* -----------------------------
     Render chart
  ----------------------------- */
  const renderChart = () => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    if (tab === "pl") {
      const [incomes, expenses] = getMonthlyData(["income", "expense"]).reduce(
        ([rev, exp], [r, e]) => [[...rev, r], [...exp, e]],
        [[], []]
      );

      const netIncome = incomes.map((r, i) => r - expenses[i]);

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
      const monthlyData = getMonthlyData(["asset", "liability"]);
      const assets = monthlyData.map(([a]) => a);
      const liabilities = monthlyData.map(([, l]) => l);
      const equity = assets.map((a, i) => a - liabilities[i]);

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
            transform: tab === "bs" ? "translateX(calc(100% + 4px))" : "translateX(0px)",
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
        onChange={(e) => setSelectedYear(Number(e.target.value))}
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

  const ChartBlock = <div className="chart-render">{selectedYear && renderChart()}</div>;

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
