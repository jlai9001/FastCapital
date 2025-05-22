import './payment_modal.css'
import React , {useState} from 'react';


function FieldContainer({isVisible}){
    if (!isVisible) {
        return null;
    }
        return(
            <>
                <div className="field_title">Account Number:</div> <input type="text" className="finance_field" value="1234-56789" readOnly/>
                <div className="field_title">Routing Number:</div> <input type="text" className="finance_field" value="123-123-1234" readOnly/>
                <div className="field_title">Bank:</div> <input type="text" className="finance_field" value="Capitalist Financials" readOnly/>
            </>
        )
}

function ExitButtonContainer({isVisible,onExit}){


    if (!isVisible) {
        return null;
    }
        return(
            <>
                <button className="exit_button" onClick={onExit}>Exit</button>
            </>
        )

}


function ButtonsContainer({isVisible, onCancel, onBuy}){
    if (!isVisible) {
        return null;
    }
        return(
            <>
                <button className="cancel_button" onClick={onCancel}>Cancel</button>
                <button className="buy_button" onClick={onBuy}>Buy</button>
            </>
        )
}




function PaymentModal(){
    const [isVisible,setIsVisible] = useState(true);
    const [showFields, setShowFields] = useState(true);
    const [showButtons, setShowButtons] = useState(true);
    const [showExitButton, setShowExitButton] = useState(false);
    const [showCompletionMessage, setShowCompletionMessage] = useState(false);

    const handle_cancel = () => {
        console.log("cancel_button")
        setIsVisible(false);
    }

    const handle_exit = () => {
        console.log("exit_button")
        setIsVisible(false);
    }

    const handle_buy = () => {
        setShowFields(false);
        setShowButtons(false); // Add this line to hide buttons
        setShowExitButton(true); // Show exit button after buying
        setShowCompletionMessage(true);
        console.log("buy_button")
    }


    if (!isVisible) {
        return null;
    }

    return (
        <div className = "payment_modal">
            <div className = "payment_bar">
                <div className = "payment_title"> Payment Confirmation</div>
            </div>

            <div className = "buttons_container"><ButtonsContainer
                isVisible={showButtons}
                onCancel={handle_cancel}
                onBuy={handle_buy}
            /></div>


            <div className = "buttons_container"><ExitButtonContainer
                isVisible={showExitButton}
                onExit={handle_exit}
            /></div>

                 {showCompletionMessage && (
                <div className="completion_message">Transaction Completed</div>
            )}

            <div className="fields_container"> <FieldContainer isVisible={showFields}/></div>

        </div>
    )

}

export default PaymentModal;
