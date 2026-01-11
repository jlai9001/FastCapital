import "./create-financials.css"

import { useState } from "react";
import { TextField, Button, MenuItem, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"; //you will have to install new dependancies
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FinancialDashboard from "../components/financials_table";
import {useNavigate} from "react-router-dom";
import { base_url } from '../api'
import { useParams } from "react-router-dom";

export default function AddFinancials() {
    const [finType, setFinType] = useState("");
    const [finAmount, setFinAmount] = useState("");
    const [finDate, setFinDate] = useState(null);
    const [refresh, setRefresh] = useState(0) // refresh dashboard after submission, this will require Financial Dashboard to accept this as a prop
    const { businessId: businessIdParam } = useParams();
    const businessId = Number(businessIdParam);
    const nav = useNavigate();

    const handleCancel = async () => {
        nav(-1);
    }

    // handle post entry
    const handleAddEntry = async () => {
        if (!finDate) {
        alert("Please select a date");
        return;
        }
        if (!finType) {
        alert("Please select a financial type");
        return;
        }
        if (!finAmount) {
        alert("Please enter an amount");
        return;
        }

        try {
        const headers = { "Content-Type": "application/json" };
        // Format date as MM/YYYY
        const month = (finDate.getMonth() + 1).toString().padStart(2, "0");
        const year = finDate.getFullYear();
        const formattedDate = `${month}/${year}`;

        const body = JSON.stringify({
            business_id: businessId,
            date: formattedDate,
            amount: finAmount,
            type: finType,
        });

        const response = await fetch(`${base_url}/api/financials`, {
            method: "POST",
            headers,
            body,
        });

        if (!response.ok) {
            const errorDetails = await response.json();
            console.error("Detailed error response:", errorDetails);
            throw new Error("Add entry failed.");
        }

        const data = await response.json();
        console.log("Entry submitted:", data);
        alert("Financial entry added successfully!");

        // reset form after submit
        setFinType("");
        setFinAmount("");
        setFinDate(null);

        // trigger dashboard refresh
            setRefresh(prev => prev + 1)
        } catch (error) {
        console.error("Error submitting:", error);
        alert("Failed to add entry, please try again.");
        }
    };

    return (
        <div className="create-financials-form">

                <div className = "financials_title">Add Financials</div>
                <div className = "financials_subtitle">
                Add financial details to your business in order to make it more
                attractive to potential investors.
                </div >
                <div className = "financial_dashboard">
                <FinancialDashboard businessId={businessId} refresh={refresh}/>
                </div>

                <div className = "field-label-container">
                    <div className ="field-label-1">Financial Data Type</div>
                    <div className ="field-label-2">Amount</div>
                    <div className ="field-label-3">Date</div>
                </div>
            {/* Form Inputs */}
            <div className ="add-entry-container">

                    <TextField className="create-financials-pulldown"
                        select
                        // label="Type"
                        value={finType}
                        onChange={(e) => setFinType(e.target.value)}
                        sx={{ minWidth: 120 }}
                        >
                        <MenuItem value="income">Income</MenuItem>
                        <MenuItem value="expense">Expense</MenuItem>
                        <MenuItem value="asset">Asset</MenuItem>
                        <MenuItem value="liability">Liability</MenuItem>
                    </TextField>

                    <TextField className="create-financials-pulldown"
                    type="number"
                    // label="Amount"
                    min="1"
                    value={finAmount}
                    onChange={(e) => setFinAmount(e.target.value)}
                    />

                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        views={["year", "month"]}
                        // label="Month and Year"
                        minDate={new Date("2000-01-01")}
                        maxDate={new Date("2100-12-31")}
                        value={finDate}
                        onChange={(newValue) => setFinDate(newValue)}
                     renderInput={(params) =>
                    <TextField
                        {...params}
                        className="date-styling"
                        helperText={null}

                    />}
                    />
                    </LocalizationProvider>

            </div>
            <div className = "bottom-container">
                <Button className="im-done" onClick={handleCancel}>
                    <div className="im-done-text">
                         I'm Done Adding Financials
                    </div>
                   </Button>
                <Button className="AddEntry_Button"  onClick={handleAddEntry}>Add Entry</Button>
            </div>
    </div>

    );
}
