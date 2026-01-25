import "./payment_modal.css";
import { useMemo, useRef, useState } from "react";
import { apiFetch } from "../api/client.js";
import { useProtectedData } from "../context/protected-data-provider.jsx";
import { useNavigate } from "react-router-dom";
import { useUIBlocker } from "../context/ui-blocker-provider.jsx";


function formatMoney(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "0";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function FieldContainer({ isVisible }) {
  if (!isVisible) return null;
  return (
    <>
      <div className="field_title">Account Number</div>
      <input type="text" className="finance_field" value="1234-56789" readOnly />

      <div className="field_title">Routing Number</div>
      <input type="text" className="finance_field" value="123-123-1234" readOnly />

      <div className="field_title">Bank</div>
      <input type="text" className="finance_field" value="Capitalist Financials" readOnly />
    </>
  );
}

function ExitButtonContainer({ isVisible, onExit, isBusy }) {
  if (!isVisible) return null;
  return (
    <button className="exit_button" onClick={onExit} disabled={isBusy}>
      Exit
    </button>
  );
}

function ButtonsContainer({ isVisible, onCancel, onBuy, isBusy }) {
  if (!isVisible) return null;

  return (
    <>
      <button className="cancel_button" onClick={onCancel} disabled={isBusy}>
        Cancel
      </button>

      <button className="buy_button" onClick={onBuy} disabled={isBusy}>
        {isBusy ? "Processing..." : "Confirm \u0026 Purchase"}
      </button>
    </>
  );
}

function PaymentModal({ onClose, investment, shareAmount, onDismissLockChange }) {
  const [isVisible, setIsVisible] = useState(true);
  const [showFields, setShowFields] = useState(true);
  const [showButtons, setShowButtons] = useState(true);
  const [showExitButton, setShowExitButton] = useState(false);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // ✅ locks UI while request is in-flight (prevents double-submit)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  // Lock dismissing the modal (overlay click / Escape / close button) while processing
  // and after a successful payment until the user clicks EXIT.
  const dismissLocked = isSubmitting || showCompletionMessage;

  const setDismissLocked = (locked) => {
    onDismissLockChange?.(Boolean(locked));
  };

  const { refreshProtectedData } = useProtectedData();
  const navigate = useNavigate();
  const { withUIBlock } = useUIBlocker();


  const totalCost = useMemo(() => {
    const shares = Number(shareAmount) || 0;
    const price = Number(investment?.price_per_share) || 0;
    return shares * price;
  }, [shareAmount, investment]);

  const handle_cancel = () => {
    if (dismissLocked || submitLockRef.current) return; // ✅ ignore dismiss while locked
    setDismissLocked(false);
    setIsVisible(false);
    onClose?.();
  };

  const handle_exit = async () => {
    if (isSubmitting) return;

    // Keep modal locked while we update portfolio
    setDismissLocked(true);

    try {
      await withUIBlock(async () => {
        await refreshProtectedData();
      }, "Updating portfolio…");
    } catch (e) {
      console.error("refreshProtectedData failed:", e);
      // We still navigate; portfolio might load via normal page logic
    }
    setDismissLocked(false);
    setIsVisible(false);
    onClose?.();
    submitLockRef.current = false;
    navigate("/portfolio", { replace: true });
  };


  const handle_buy = async () => {
    // ✅ immediate lock (prevents even ultra-fast double-clicks before re-render)
    if (submitLockRef.current) return;

    if (!investment?.id || !shareAmount || Number(shareAmount) <= 0) {
      console.log("Missing or invalid purchase details.");
      return;
    }

    submitLockRef.current = true;
    setIsSubmitting(true);
    setDismissLocked(true);

    let success = false;

    const body = JSON.stringify({
      investment_id: investment.id,
      shares_purchased: Number(shareAmount),
      cost_per_share: Number(investment.price_per_share),
      purchase_date: new Date().toISOString(),
    });


    try {
      await withUIBlock(async () => {
        const response = await apiFetch(`/api/purchases`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });

        if (!response.ok) {
          const errorDetails = await response.json().catch(() => null);
          console.error("Detailed error response:", errorDetails);
          throw new Error("Purchase failed");
        }

        const data = await response.json().catch(() => null);
        console.log("Purchase successful:", data);
      }, "Processing purchase…");

      // ✅ success: keep modal locked on completion screen
      success = true;
      setDismissLocked(true);

      setShowFields(false);
      setShowButtons(false);
      setShowExitButton(true);
      setShowCompletionMessage(true);
    } catch (error) {
      console.error("Error during purchase:", error);
      console.log("Failed to complete transaction");

      // ✅ allow retry on failure
      submitLockRef.current = false;
      setDismissLocked(false);
    } finally {
      setIsSubmitting(false);
      if (success) setDismissLocked(true);
    }

  };


  if (!isVisible) return null;

  return (
    <div
      className={`payment_modal ${isSubmitting ? "is-submitting" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Payment Confirmation"
      aria-busy={isSubmitting}
    >
      <div className="payment_header">
        <div className="payment_title">Payment Confirmation</div>

        <button
          className="payment_close"
          onClick={handle_cancel}
          aria-label="Close"
          disabled={dismissLocked}
        >
          ×
        </button>
      </div>

      <div className="payment_body">
        <div className="payment_summary">
          <div className="payment_summary_row">
            <span>Shares</span>
            <span>{Number(shareAmount) || 0}</span>
          </div>
          <div className="payment_summary_row">
            <span>Price / Share</span>
            <span>${formatMoney(investment?.price_per_share)}</span>
          </div>
          <div className="payment_summary_row payment_summary_total">
            <span>Total</span>
            <span>${formatMoney(totalCost)}</span>
          </div>
        </div>

        <div className="fields_container">
          <FieldContainer isVisible={showFields} />

          {showCompletionMessage && (
            <div className="completion_message">Transaction Completed</div>
          )}

          <div className="payment_actions">
            <ButtonsContainer
              isVisible={showButtons}
              onCancel={handle_cancel}
              onBuy={handle_buy}
              isBusy={isSubmitting}
            />

            <ExitButtonContainer
              isVisible={showExitButton}
              onExit={handle_exit}
              isBusy={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
