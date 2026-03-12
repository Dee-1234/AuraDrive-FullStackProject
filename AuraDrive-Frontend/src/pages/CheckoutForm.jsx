import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const CheckoutForm = ({ rideId, amount, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements) return;

        // 1. Get Client Secret from your Backend
        const { data: { clientSecret } } = await axios.post(`/api/payments/create-intent`, {
            rideId,
            amount
        });

        // 2. Confirm Payment with Stripe
        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: { card: elements.getElement(CardElement) }
        });

        if (result.error) {
            console.error(result.error.message);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                onSuccess(); // Trigger Receipt View
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
            <h3 className="mb-4 text-lg font-bold">Complete Payment: ₹{amount}</h3>
            <div className="p-3 border rounded bg-white mb-4">
                <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
            </div>
            <button 
                type="submit" 
                disabled={!stripe}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
                Pay Now
            </button>
        </form>
    );
};

export default CheckoutForm;