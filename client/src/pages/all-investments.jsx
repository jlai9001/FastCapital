import React from "react"
import InvestmentCardsList from "../components/investment-cards-list.jsx"
import "./all-investments.css"

export default function AllInvestments() {
    return (
    <>
        <div>
            <h1>Investment Opportunities</h1>
        </div>
        <div>
        <InvestmentCardsList />
        </div>
        </>
    )
}
