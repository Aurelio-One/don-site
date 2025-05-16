import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Swal from "sweetalert2";
import "./App.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

function PaymentForm({ amount }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    Swal.fire({
      title: `${amount}€`,
      text: "Paiement en cours. Ne touchez à rien.",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
      background: "#000",
      color: "#fff",
    });

    const res = await fetch("/.netlify/functions/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const { clientSecret } = await res.json();

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    if (result.error) {
      Swal.fire("Erreur", result.error.message, "error");
    } else if (result.paymentIntent.status === "succeeded") {
      Swal.fire("Fait.", "C'est payé. Tu peux partir.", "success");
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <CardElement className="card-element" />
      <button type="submit" className="btn dom-btn" disabled={!stripe || loading}>
        Payer {amount}€
      </button>
    </form>
  );
}

function App() {
  const [selectedAmount, setSelectedAmount] = useState(null);

  return (
    <div className="container dark">
      <div className="card dom">
        <h1 className="dom-title">Soumets-toi.</h1>
        <p className="dom-sub">Tu paies. Tu n’existes plus.</p>

        {!selectedAmount ? (
          <div className="buttons">
            {[5, 10, 20, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                className="btn dom-btn"
                onClick={() => setSelectedAmount(amt)}
              >
                {amt} €
              </button>
            ))}
          </div>
        ) : (
          <Elements stripe={stripePromise}>
            <PaymentForm amount={selectedAmount} />
          </Elements>
        )}
      </div>
    </div>
  );
}

export default App;
