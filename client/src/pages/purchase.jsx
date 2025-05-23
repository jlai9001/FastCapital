import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {useOffer, useBusiness} from "../hooks/getData"
import PaymentModal from "./payment_modal"


export default function Purchase(){
	const nav = useNavigate()
	const offerId = 2
	const userId = 3
    const offerData = useOffer(offerId)
	const offer = offerData.data
    const businessData = useBusiness(offer ? offer.business_id : null)
	const business = businessData.data
	const [shareAmount, setShareAmount] = useState(0)
	const [totalPrice, setTotalPrice] = useState(0.00)
	const [showModal, setShowModal] = useState(false)
	//declaring variables

	useEffect(() => {
		if (offer){
		setTotalPrice(shareAmount * offer.price_per_share)};
	}, [shareAmount, offer])
	//checking data fetch

	function handleShareAmount(e) {
		let value = parseInt(e.target.value, 10);
		if (value > offer.shares_available){
			value = offer.shares_available
		}
		else if (value < 0){value = 0}
		const min = offer.min_investment;
		if (value % min !== 0) {
		value = Math.floor(value / min) * min} // Round down to nearest valid multiple (for manual input)
		if (!isNaN(value)) {
			setShareAmount(value);
		} else {
			setShareAmount(0);
		}

	} //input desired share amount

	function modalPop(){
    if (shareAmount > 0) {
      setShowModal(true);
    } else {
      alert("Please enter a valid number of shares");
    }
  } // shows modal to confirm purchase request

  function handleModalClose() {
    setShowModal(false);
  } //hides modal

  function handleCancel(){
	nav(-1)
  } //nav back

  if (offerData.loading) return <p>Loading offer...</p>;
  if (offerData.error) return <p>Error loading offer: {offerData.error}</p>;
  if (!offer) return <p>No offer found</p>;
  	//render loading and errors (above and below)
  if (businessData.loading) return <p>Loading business info...</p>;
  if (businessData.error) return <p>Error loading business: {businessData.error}</p>;
  if (!business) return <p>No business found</p>;

    return(
        <>
        <h2> Name: {business.name} </h2>
		<h3> Location: {business.city}. {business.state} </h3>
		<div>
			<p> Price per Share: <span/> {offer.price_per_share} </p>
			<p> Shares Available: <span/> {offer.shares_available}</p>
			<p> Number of shares: <input type="number" max={offer.shares_available} min="0" step={offer.min_investment} value={shareAmount}
				onChange={handleShareAmount} /> </p>
			<p> Total Price: ${totalPrice.toFixed(2)} </p>
		</div>
		<div>
			<button onClick={handleCancel}>Cancel</button>
			<button onClick={modalPop} disabled={shareAmount <= 0}>Buy Now</button>
			{showModal && (<PaymentModal onClose={handleModalClose} offer={offer} userId={userId} shareAmount={shareAmount}></PaymentModal>)}
		</div>
        </>
    )
}
