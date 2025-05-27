import React from "react"
import OfferCards from "../components/offer-cards.jsx"
import FinancialDashboard from "../components/financials_table.jsx"

export default function TestPage() {
    return (
       <>
       <div>
            <FinancialDashboard businessId={1}/>
        </div>
        <div>
            <h1>Test Page</h1>
            <OfferCards />
        </div>
        </>
    )
}
