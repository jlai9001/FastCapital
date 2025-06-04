import "./create-financials.css"

import { useState } from "react";
import { TextField, Button, MenuItem, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"; //you will have to install new dependancies
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FinancialDashboard from "../components/financials_table";

export default function AddFinancials() {
    const [finType, setFinType] = useState("");
    const [finAmount, setFinAmount] = useState("");
    const [finDate, setFinDate] = useState(null);
    const [refresh, setRefresh] = useState(0) // refresh dashboard after submission, this will require Financial Dashboard to accept this as a prop
     const businessId = 1; //make this dynamic

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

        const response = await fetch(`http://localhost:8000/api/financials`, {
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
        <>
        <div>
            <div className = "financials_title">Add Financials</div>
            <div className = "financials_subtitle">
            Add financial details to your business in order to make it more
            attractive to potential investors.
            </div >
            <div className = "financial_dashboard">
            <FinancialDashboard businessId={businessId} refresh={refresh}/>
            </div>
        </div>
        <br />

        {/* Form Inputs */}
        <Box display="flex" gap={2} my={2} alignItems="center">
            <TextField
            select
            label="Type"
            value={finType}
            onChange={(e) => setFinType(e.target.value)}
            sx={{ minWidth: 120 }}
            >
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
            <MenuItem value="asset">Asset</MenuItem>
            <MenuItem value="liability">Liability</MenuItem>
            </TextField>

            <TextField
            type="number"
            label="Amount"
            min="1"
            value={finAmount}
            onChange={(e) => setFinAmount(e.target.value)}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
                views={["year", "month"]}
                label="Month and Year"
                minDate={new Date("2000-01-01")}
                maxDate={new Date("2100-12-31")}
                value={finDate}
                onChange={(newValue) => setFinDate(newValue)}
                renderInput={(params) => <TextField {...params} helperText={null} />}
            />
            </LocalizationProvider>

            <Button variant="contained" onClick={handleAddEntry}>
            Add Entry
            </Button>
        </Box>
        <br />
        <div>
            <Button>I'm done adding financials.</Button>
        </div>
        </>
    );
}
