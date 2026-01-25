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
import { useUIBlocker } from "../context/ui-blocker-provider.jsx";

export default function AddFinancials() {
    const [finType, setFinType] = useState("");
    const [finAmount, setFinAmount] = useState("");
    const [finDate, setFinDate] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    const VALID_FIN_TYPES = ["income", "expense", "asset", "liability"];

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

    // ------------------------------------------------------
    // Form validity (drives Add Entry enabled/disabled + color)
    // ------------------------------------------------------
    const isBusinessIdValid = Number.isFinite(businessId) && businessId > 0;
    const isTypeValid = VALID_FIN_TYPES.includes(finType);

    const amountNumber = Number(finAmount);
    const isAmountValid = Number.isFinite(amountNumber) && amountNumber > 0;

    const isDateValid =
        finDate instanceof Date && !Number.isNaN(finDate.getTime());

    const isEntryValid = isBusinessIdValid && isTypeValid && isAmountValid && isDateValid;

    const { businessFinancials, refreshProtectedData } = useProtectedData();
    const { withUIBlock } = useUIBlocker();

    const handleCancel = async () => {
    try {
        await withUIBlock(async () => {
        await refreshProtectedData();
        }, "Updating business profile…");
    } catch (e) {
        console.error("refreshProtectedData failed:", e);
    }
    nav("/business-profile", { replace: true });
    };

    // handle post entry
    const handleAddEntry = async () => {
        // Extra safety: button is disabled when invalid, but keep guard.
        if (!isEntryValid) {
        alert("Please complete all entry fields with valid values.");
        return;
        }

        if (!Number.isFinite(businessId)) {
        alert("Invalid business id in URL.");
        return;
        }

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
    await withUIBlock(async () => {
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
        const errorDetails = await response.json().catch(() => null);
        console.error("Detailed error response:", errorDetails);
        throw new Error("Add entry failed.");
        }

        const data = await response.json().catch(() => null);
        console.log("Entry submitted:", data);

        await refreshProtectedData();
    }, "Adding financial entry…");

    alert("Financial entry added successfully!");

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
                onChange={(e) => setFinAmount(e.target.value)}
                placeholder={isMobile ? "Amount" : undefined}
                inputProps={{ inputMode: "numeric", min: 1 }}
            />
            </div>

            <div className="fin-field fin-date">
                <LocalizationProvider dateAdapter={AdapterDateFns}>

                <DatePicker
                views={["year", "month"]}
                format="MM/yyyy"
                minDate={new Date("2000-01-01")}
                maxDate={new Date("2100-12-31")}
                value={finDate}
                onChange={(newValue) => setFinDate(newValue)}
                localeText={{
                    fieldMonthPlaceholder: () => "mm",
                    fieldYearPlaceholder: () => "yyyy",
                }}
                slotProps={{
                    textField: {
                    className: "date-styling",
                    helperText: null,
                    InputLabelProps: { shrink: true },
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

                <Button
                    className="AddEntry_Button"
                    disabled={!isEntryValid}
                    onClick={handleAddEntry}
                >
                    Add Entry
                </Button>
            </div>
    </div>

    );
}
