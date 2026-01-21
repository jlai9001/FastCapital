import "./financials_table.css";
import { useState } from "react";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

// ✅ Supports:
// - "YYYY-MM-DD" (and "YYYY-MM-DDTHH:MM...")
// - "MM/YYYY"
// - fallback to Date parsing if possible
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

export default function FinancialDashboard({ financials }) {
  const years = Array.from(
    new Set(
      financials
        .map((f) => parseFinancialDate(f.date)?.year)
        .filter((y) => Number.isFinite(y))
    )
  ).sort((a, b) => b - a);

  const [selectedYear, setSelectedYear] = useState(
    years[0] ?? new Date().getFullYear()
  );
  const [selectedView, setSelectedView] = useState("income_statement"); // "income_statement" or "balance_sheet"

  const financialsForYear = financials.filter(
    (f) => parseFinancialDate(f.date)?.year === selectedYear
  );

  const grouped = financialsForYear.reduce((acc, f) => {
    const parsed = parseFinancialDate(f.date);
    if (!parsed) return acc;

    const month = parsed.monthIndex;
    acc[month] = acc[month] || { income: 0, expense: 0, asset: 0, liability: 0 };
    acc[month][f.type] += Number(f.amount || 0);
    return acc;
  }, {});

  const data = MONTHS.map((month, index) => ({
    month,
    income: grouped[index]?.income || 0,
    expense: grouped[index]?.expense || 0,
    netIncome: (grouped[index]?.income || 0) - (grouped[index]?.expense || 0),
    asset: grouped[index]?.asset || 0,
    liability: grouped[index]?.liability || 0,
  }));

  const displayedData =
    selectedView === "income_statement"
      ? data.map((d) => ({
          month: d.month,
          income: d.income,
          expense: d.expense,
          netIncome: d.netIncome,
        }))
      : data.map((d) => ({
          month: d.month,
          asset: d.asset,
          liability: d.liability,
        }));

  const maxValue = Math.max(
    ...displayedData.flatMap((d) =>
      selectedView === "income_statement"
        ? [d.income, d.expense, d.netIncome]
        : [d.asset, d.liability]
    ),
    1
  );

  const legendItems =
    selectedView === "income_statement"
      ? [
          { label: "Income", color: "#3f51b5" },
          { label: "Expenses", color: "#f9a825" },
          { label: "Net Income", color: "#ef5350" },
        ]
      : [
          { label: "Assets", color: "#66bb6a" },
          { label: "Liabilities", color: "#ef5350" },
        ];

  const barGroups =
    selectedView === "income_statement"
      ? [
          { key: "income", color: "#3f51b5" },
          { key: "expense", color: "#f9a825" },
          { key: "netIncome", color: "#ef5350" },
        ]
      : [
          { key: "asset", color: "#66bb6a" },
          { key: "liability", color: "#ef5350" },
        ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="year-selector">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value="">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="tab-buttons">
          <button
            className={`tab-btn ${
              selectedView === "income_statement" ? "active" : ""
            }`}
            onClick={() => setSelectedView("income_statement")}
          >
            Income Statement
          </button>
          <button
            className={`tab-btn ${
              selectedView === "balance_sheet" ? "active" : ""
            }`}
            onClick={() => setSelectedView("balance_sheet")}
          >
            Balance Sheet
          </button>
        </div>
      </div>

      <div className="chart-render">
        <div className="legend">
          {legendItems.map((item) => (
            <div className="legend-item" key={item.label}>
              <span
                className="legend-color"
                style={{ backgroundColor: item.color }}
              ></span>
              <span className="legend-label">{item.label}</span>
            </div>
          ))}
        </div>

        <div className="bar-chart">
          {displayedData.map((d) => (
            <div className="bar-group" key={d.month}>
              {barGroups.map((bar) => (
                <div
                  key={bar.key}
                  className="bar"
                  style={{
                    height: `${(Math.abs(d[bar.key]) / maxValue) * 100}%`,
                    backgroundColor: bar.color,
                  }}
                  title={`${bar.key}: ${d[bar.key]}`}
                ></div>
              ))}
              <div className="bar-label">{d.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
