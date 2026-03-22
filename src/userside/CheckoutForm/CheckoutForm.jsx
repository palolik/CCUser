import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { useEffect, useState } from "react";
// import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { PropTypes } from 'prop-types';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { base_url } from "../../config/config";
const CheckoutForm = ({price, packageId}) => {
    const [error, setError] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [trxId, setTrxId] = useState('');

    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    const userEmail = localStorage.getItem('userEmail');

 
    useEffect( ()=>{
        // console.log('checkout price: ',price);
        axios.post(`${base_url}/createPaymentIntent`, {price})
        .then(res => {
            // console.log(res.data.clientSecret);
            setClientSecret(res.data.clientSecret);
        })
    }
    ,[price])

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }
        const card = elements.getElement(CardElement)
    
        if (card === null) {
            return;
        }
        const {error, paymentMethod} = await stripe.createPaymentMethod({
            type: 'card',
            card
        })

        if(error){
            console.log('Payment Error', error)
            setError(error.message)
        }
        else{
            console.log('payment method', paymentMethod)
            setError('')
        }
        // confirm payment

        const  {paymentIntent, error: confirmError} = await stripe.confirmCardPayment(clientSecret, {
            payment_method:{
                card: card,
                billing_details: {
                    email: userEmail,
                    name:  'anonymous'
                },
            }
        })

        if(confirmError){
            console.log('confirm error')
        }
        else{
            console.log('Payment Intent: ', paymentIntent.status)
            if(paymentIntent.status === 'succeeded')
            {
                const order = {
                    email: userEmail,
                    secret: clientSecret,
                    transaction: paymentIntent.id,
                    packageId: packageId,
                    packagePrice: price,
                    date: new Date(),
                }

                axios.post(`${base_url}/addOrder`, order)
                .then(res => {
                    if(res.data.acknowledged)
                    {
                        setTrxId(paymentIntent.id)
                        navigate('/client');
                        console.log(res)
                    }
                })
                .catch(error => {
                    console.log(error.message)
                })

                // console.log(order);
            }
            else{
                setTrxId('')
            }
        }
    }

    return (
        <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <CardElement
                options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }}
            />
            <button type="submit" disabled={!stripe || !clientSecret || trxId} className="bg-black text-white p-2 rounded-lg">Pay with Stripe</button>
            <p className="text-red-600">{error}</p>
            {trxId && <p className="text-green-600">Your transaction id is: {trxId}</p>}

        </form>
    );
};

CheckoutForm.propTypes = {
    price: PropTypes.number,
    packageId: PropTypes.string,
};

export default CheckoutForm;