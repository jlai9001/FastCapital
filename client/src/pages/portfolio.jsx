import React from "react"
import PendingInvestmentsCard from '../components/pending-investments-card'

export default function Portfolio(){
    return(
        <>
            <section className="your-investments">
                <h2>Your Investments</h2>
                <div>Placeholder for investment graphs</div>
            </section>
            <section className="pending-investments">
                <h2>Pending Investments</h2>
                <PendingInvestmentsCard
          purchase={{
            id: 101,
            name: "Bob’s Coffee",
            location: "Los Angeles, CA",
            percentComplete: "10% of requested shares sold",
            sharesBought: "100 Shares",
          }}
        />

        <PendingInvestmentsCard
          purchase={{
            id: 102,
            name: "Sunny’s Books",
            location: "Seattle, WA",
            percentComplete: "50% of requested shares sold",
            sharesBought: "250 Shares",
          }}
        />

        <PendingInvestmentsCard
          purchase={{
            id: 103,
            name: "Green Thumb Nursery",
            location: "Portland, OR",
            percentComplete: "75% of requested shares sold",
            sharesBought: "300 Shares",
          }}
        />
            </section>
        </>
    )
}
