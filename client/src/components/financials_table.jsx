import React, { useState, useEffect} from "react";
import { BarChart } from '@mui/x-charts/BarChart';
import axios from "axios";
import "./financials_table.css";

function FinancialDashboard({ businessId }) {
    const [tab, setTab] = useState('pl');
    const [financials, setFinancials] = useState([]);
    const [years, setYears] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);

    useEffect(() => {
        axios
            .get(`http://localhost:8000/api/financials/${businessId}`)
            .then((res) => {
                const data = res.data;

                if (!Array.isArray(data)) {
                    console.error("Expected array but got:", data);
                    setFinancials([]);
                    setYears([]);
                    setSelectedYear(null);
                    return;
                }

                setFinancials(data);

                const yearSet = new Set(data.map((f) => new Date(f.date).getFullYear()));
                const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
                setYears(sortedYears);
                if (sortedYears.length) setSelectedYear(sortedYears[0]);
            })
            .catch((err) => console.error('Failed to fetch financials', err));
    }, [businessId]);

    const getMonthlyData = (typeKeys) => {
        const monthly = Array(12).fill(0).map(() => ({}));

        financials
            .filter((f) => new Date(f.date).getFullYear() === selectedYear)
            .forEach((f) => {
                const month = new Date(f.date).getMonth();
                const key = f.type.toLowerCase();

                if (typeKeys.includes(key)) {
                    monthly[month][key] = (monthly[month][key] || 0) + f.amount;
                }
            });

        return monthly.map((entry) => typeKeys.map((key) => entry[key] || 0));
    };

    const renderChart = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        if (tab === 'pl') {
            const [incomes, expenses] = getMonthlyData(['income', 'expense']).reduce(
                ([rev, exp], [r, e]) => [[...rev, r], [...exp, e]],
                [[], []]
            );

            const netIncome = incomes.map((r, i) => r - expenses[i]);

            return (
                <BarChart
                    xAxis={[{ scaleType: 'band', data: months }]}
                    series={[
                       { label: 'Income', data: incomes },
                       { label: 'Expenses', data: expenses },
                       { label: 'Net Income', data: netIncome },
                    ]}
                    width={700}
                    height={400}
                />
            );
        }

        if (tab === 'bs') {
            const monthlyData = getMonthlyData(['asset', 'liability']);
            const assets = monthlyData.map(([a]) => a);
            const liabilities = monthlyData.map(([, l]) => l);
            const equity = assets.map((a, i) => a - liabilities[i]);

            return (
                <BarChart
                    xAxis={[{ scaleType: 'band', data: months }]}
                    series={[
                        { label: 'Assets', data: assets },
                        { label: 'Liabilities', data: liabilities },
                        { label: 'Equity', data: equity },
                    ]}
                    width={700}
                    height={400}
                />
            );
        }

        return null;
    };

    return (
        <div className="financial-dashboard">
            {/* Tabs */}
            <div className="financial-dashboard-tabs">
                <button onClick={() => setTab('pl')}>Profit & Loss</button>
                <button onClick={() => setTab('bs')}>Balance Sheet</button>
            </div>

            {/* Dropdown */}
            <div className="financial-dashboard-dropdown">
                <label>Select Year: </label>
                <select value={selectedYear || ''} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                    {years.map((year) => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            </div>

            {/* Chart */}
            {selectedYear && renderChart()}
        </div>
    );
}
export default FinancialDashboard;
