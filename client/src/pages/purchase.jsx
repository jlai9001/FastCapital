import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {useInvestment, useBusiness} from "../hooks/getData"
import { useUser } from "../context/user-provider"
import PaymentModal from "./payment_modal"



export default function Purchase(){
	const nav = useNavigate()
	const { investmentId } = useParams()
	const userId = useUser()

	const { data: investment, loading: investmentLoading, error: investmentError} = useInvestment(investmentId);
	const { data: business, loading: businessLoading, error: businessError } = useBusiness(investment?.business_id);

	const [shareAmount, setShareAmount] = useState(0)
	const [totalPrice, setTotalPrice] = useState(0.00)
	const [showModal, setShowModal] = useState(false)
	//declaring variables

	useEffect(() => {
		if (investment){
		setTotalPrice(shareAmount * investment.price_per_share)};
	}, [shareAmount, investment])
	//checking data fetch

	function handleShareAmount(e) {

		if (!investment) return;

		let value = parseInt(e.target.value, 10);
		const max = investment.shares_available
		const min = investment.min_investment;

		if (isNaN(value) || value < 0) value = 0;
		if (value > max) value = max;
		if (value % min !==  0) {
			Math.floor(value / min) * min
		}

		setShareAmount(value)
	}

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

  if (investmentLoading || businessLoading) return <p>Loading...</p>;
  if (investmentError || businessError) return <p>Error: {invError || busError}</p>;
  if (!investment || !business) return <p>Data not found.</p>;

  return (
    <>
      <h2>Name: {business.name}</h2>
      <h3>Location: {business.city}, {business.state}</h3>
      <div>
        <p>Price per Share: ${investment.price_per_share}</p>
        <p>Shares Available: {investment.shares_available}</p>
        <p>
          Number of shares:{" "}
          <input
            type="number"
            max={investment.shares_available}
            min="0"
            step={investment.min_investment}
            value={shareAmount}
            onChange={handleShareAmount}
          />
        </p>
        <p>Total Price: ${totalPrice.toFixed(2)}</p>
      </div>
      <div>
        <button onClick={handleCancel}>Cancel</button>
        <button onClick={modalPop} disabled={shareAmount <= 0}>
          Buy Now
        </button>
        {showModal && investment && (
          <PaymentModal
            onClose={handleModalClose}
            investment={investment}
            userId={userId}
            shareAmount={shareAmount}
          />
        )}
      </div>
    </>
  );
}
