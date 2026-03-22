import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../CheckoutForm/CheckoutForm";
import { PropTypes } from 'prop-types';


const stripePromise = loadStripe('pk_test_51Q9alkKIdogrAFXhkcBdTlaBltAyPAmja7mrF5sr1IpvGt8uThKnHeZKMNiJ6IVhUFQpvB8FB5P3EeFCcErBAkQ8002dJbudMY'); // Replace with your Stripe public key
// const price = 
const Payments = ({packagePrice, packageId}) => {
    // console.log('payment priceId',packageId)
    return (
        <div>
            <Elements stripe={stripePromise}>
                <CheckoutForm  price = {packagePrice} packageId={packageId}></CheckoutForm>
            </Elements>
        </div>
    );
};

Payments.propTypes = {
    packagePrice: PropTypes.number,
    packageId: PropTypes.string,
}

export default Payments;