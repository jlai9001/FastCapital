import { useState, useEffect } from "react"
import {useOffer, useBusiness} from "../hooks/getData"


export default function Purchase({offerId, businessId}){
    const offer = useOffer(offerId)
    const business = useBusiness(businessId)
	const [shareAmount, setShareAmount] = useState(0)
	const [totalPrice, setTotalPrice] = useState(0.00)

	useEffect(() => {
		setTotalPrice(shareAmount * offer.price_per_share);
	}, [shareAmount, offer.price_per_share])

	function handleShareAmount(e) {
		const value = parseInt(e.target.value, 10);
		if (!isNaN(value)) {
			setShareAmount(value);
		} else {
			setShareAmount(0);
		}
	}

    return(
        <>
        <h2> Name: {business.name} </h2>
		<h3> Location: {business.city}. {business.state} </h3>
		<div>
			<p> Price per Share: <span/> {offer.price_per_share} </p>
			<p> Number of shares: <input type="number" max={offer.shares_available} value={shareAmount}
				onChange={handleShareAmount} /> </p>
			<p> Total Price: {totalPrice} </p>
		</div>
		<div>
			<button>Cancel</button>
			<button>Buy Now</button>
		</div>
        </>
    )
}
