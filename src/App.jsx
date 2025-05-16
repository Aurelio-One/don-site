import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Swal from "sweetalert2";
import "./App.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const amounts = [5, 10, 20, 50, 100, 500];

function App() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async (amount) => {
    setLoading(true);
    const stripe = await stripePromise;

    const response = await fetch("/.netlify/functions/create-checkout-session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      Swal.fire("Erreur", result.error.message, "error");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Soutenez-nous 🤍</h1>
        <p>Choisissez un montant</p>
        <div className="buttons">
          {amounts.map((amt) => (
            <button
              key={amt}
              className="btn"
              onClick={() => handlePayment(amt)}
              disabled={loading}
            >
              {amt} €
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
