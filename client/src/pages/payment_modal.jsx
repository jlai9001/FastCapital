import './payment_modal.css'
import React, { useState } from 'react';
import { apiFetch } from "../api/client.js";

function FieldContainer({ isVisible }) {
    if (!isVisible) return null;
    return (
        <>
            <div className="field_title">Account Number:</div>
            <input type="text" className="finance_field" value="1234-56789" readOnly />
            <div className="field_title">Routing Number:</div>
            <input type="text" className="finance_field" value="123-123-1234" readOnly />
            <div className="field_title">Bank:</div>
            <input type="text" className="finance_field" value="Capitalist Financials" readOnly />
        </>
    );
}

function ExitButtonContainer({ isVisible, onExit }) {
    if (!isVisible) return null;
    return <button className="exit_button" onClick={onExit}>Exit</button>;
}

function ButtonsContainer({ isVisible, onCancel, onBuy }) {
    if (!isVisible) return null;
    return (
        <>
            <button className="cancel_button" onClick={onCancel}>Cancel</button>
            <button className="buy_button" onClick={onBuy}>Confirm & Purchase</button>
        </>
    );
}

function PaymentModal({ onClose, investment, shareAmount, userId }) {
    const [isVisible, setIsVisible] = useState(true);
    const [showFields, setShowFields] = useState(true);
    const [showButtons, setShowButtons] = useState(true);
    const [showExitButton, setShowExitButton] = useState(false);
    const [showCompletionMessage, setShowCompletionMessage] = useState(false);

    const handle_cancel = () => {
        console.log("Cancel button clicked");
        setIsVisible(false);
        onClose();
    };

    const handle_exit = () => {
        console.log("Exit button clicked");
        setIsVisible(false);
        onClose();
    };

const handle_buy = async () => {
    if (!investment?.id || !shareAmount || Number(shareAmount) <= 0) {
        alert("Missing or invalid purchase details. Please try again.");
        return;
    }

    const body = JSON.stringify({
        investment_id: investment.id,
        shares_purchased: Number(shareAmount),
        cost_per_share: Number(investment.price_per_share),
        purchase_date: new Date().toISOString(),
    });

    try {
        const response = await apiFetch(`/api/purchases`, {
        method: "POST",
        customHeaders: { "Content-Type": "application/json" },
        body,
        });

        if (!response.ok) {
        const errorDetails = await response.json().catch(() => null);
        console.error("Detailed error response:", errorDetails);
        throw new Error("Purchase failed");
        }

        const data = await response.json();
        console.log("Purchase successful:", data);

        setShowFields(false);
        setShowButtons(false);
        setShowExitButton(true);
        setShowCompletionMessage(true);
    } catch (error) {
        console.error("Error during purchase:", error);
        alert("Failed to complete transaction. Please try again.");
    }
    };


    if (!isVisible) return null;

    return (
        <div className="payment_modal">
            <div className="payment_bar">
                <div className="payment_title">Payment Confirmation</div>
            </div>

            <div className="fields_container">
                <FieldContainer isVisible={showFields} />

                <div className="buttons_container">
                    <ButtonsContainer
                        isVisible={showButtons}
                        onCancel={handle_cancel}
                        onBuy={handle_buy}
                    />
                </div>
                <div className="buttons_container">
                    <ExitButtonContainer
                        isVisible={showExitButton}
                        onExit={handle_exit}
                    />
                </div>
            </div>

            {showCompletionMessage && (
                <div className="completion_message">Transaction Completed</div>
            )}
        </div>
    );
}

export default PaymentModal;
