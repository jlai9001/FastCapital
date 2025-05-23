import './payment_modal.css'
import React, { useState } from 'react';

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
            <button className="buy_button" onClick={onBuy}>Buy</button>
        </>
    );
}

function PaymentModal({ onClose, offer, shareAmount, userId }) {
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
        const headers = { "Content-Type": "application/json" };
        const body = JSON.stringify({
            offer_id: offer.id,
            users_id: userId,
            shares_purchased: shareAmount,
            cost_per_share: offer.price_per_share,
            purchase_date: new Date().toISOString()
        });

        try {
            const response = await fetch(`http://localhost:8000/api/purchase`, {
                method: 'POST',
                headers,
                body
            });

            if (!response.ok) {
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

            {showCompletionMessage && (
                <div className="completion_message">Transaction Completed</div>
            )}

            <div className="fields_container">
                <FieldContainer isVisible={showFields} />
            </div>
        </div>
    );
}

export default PaymentModal;
