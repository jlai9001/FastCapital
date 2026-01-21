import "./create-financials.css"
import { useProtectedData } from "../context/protected-data-provider.jsx";
import { useState, useEffect } from "react";
import { TextField, Button, MenuItem } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"; //you will have to install new dependancies
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import FinancialDashboard from "../components/financials_table";
import {useNavigate} from "react-router-dom";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api/client.js";

export default function AddFinancials() {
    const [finType, setFinType] = useState("");
    const [finAmount, setFinAmount] = useState("");
    const [finDate, setFinDate] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    }, []);

    const finTypeLabels = {
    income: "Income",
    expense: "Expense",
    asset: "Asset",
    liability: "Liability",
    };



    const { businessId: businessIdParam } = useParams();
    const businessId = Number(businessIdParam);
    const nav = useNavigate();

    const { businessFinancials, refreshProtectedData } = useProtectedData();

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

        const response = await apiFetch("/api/financials", {
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

        await refreshProtectedData();


        // reset form after submit
        setFinType("");
        setFinAmount("");
        setFinDate(null);

        } catch (error) {
        console.error("Error submitting:", error);
        alert("Failed to add entry, please try again.");
        }
    };

    return (
        <div className="create-financials-form">

                <div className = "financials_title">Add Financials</div>
                <div className = "financials_subtitle add-financials-subtext">
                Add financial details to your business in order to make it more
                attractive to potential investors.
                </div >
                <div className = "financial_dashboard">
                <FinancialDashboard financials={businessFinancials} />
                </div>

                <div className = "field-label-container">
                    <div className ="field-label-1">Financial Data Type</div>
                    <div className ="field-label-2">Amount</div>
                    <div className ="field-label-3">Date</div>
                </div>
            {/* Form Inputs */}

        <div className="add-entry-container">

            <div className="fin-field fin-type">
                <TextField className={`create-financials-pulldown ${
                    isMobile && !finType ? "placeholder-text" : ""
                }`}
                select
                value={finType}
                onChange={(e) => setFinType(e.target.value)}
                sx={{ minWidth: 120 }}
                slotProps={
                isMobile
                    ? {
                        select: {
                        displayEmpty: true,
                        renderValue: (selected) => {
                            if (!selected) return "Financial Data Type";
                            return finTypeLabels[selected] ?? selected;
                        },
                        },
                    }
                    : undefined
                }
                >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
                <MenuItem value="asset">Asset</MenuItem>
                <MenuItem value="liability">Liability</MenuItem>
                </TextField>
            </div>

            <div className="fin-field fin-amount">
            <TextField
                className="create-financials-pulldown"
                type="number"
                value={finAmount}
                onChange={(e) => {
                const v = e.target.value;
                if (v === "") return setFinAmount("");
                if (Number(v) === 0) return setFinAmount(""); // only blocks pure zero
                setFinAmount(v);
                }}
                placeholder={isMobile ? "Amount" : undefined}
                inputProps={{ inputMode: "numeric", min: 1 }}
            />
            </div>

            <div className="fin-field fin-date">
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                views={["year", "month"]}
                minDate={new Date("2000-01-01")}
                maxDate={new Date("2100-12-31")}
                value={finDate}
                onChange={(newValue) => setFinDate(newValue)}
                localeText={
                isMobile
                    ? {
                        fieldMonthPlaceholder: () => "Date",
                        fieldYearPlaceholder: () => "",
                    }
                    : undefined
                }
                slotProps={{
                textField: {
                    className: "date-styling",
                    helperText: null,
                    placeholder: "mm/yyyy",
                    InputLabelProps: { shrink: true }, // keeps it from looking weird with placeholders
                },
                }}

                />
                </LocalizationProvider>
            </div>
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
