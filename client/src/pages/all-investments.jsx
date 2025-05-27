import React from "react"
import InvestmentCards from "../components/investment-cards.jsx"
import "./all-investments.css"

export default function AllInvestments() {
    return (
       <>
        <div>
            <h1>All Investments</h1>
        </div>
        <div>
        <InvestmentCards />
        </div>
        </>
    )
}
