import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import Swal from "sweetalert2";

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
    <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center" }}>
      <div style={{ padding: 24, border: "1px solid #ccc", borderRadius: 10, backgroundColor: "#fff" }}>
        <h1 style={{ textAlign: "center" }}>Soutenez-nous 💙</h1>
        <p style={{ textAlign: "center" }}>Choisissez un montant :</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {amounts.map((amt) => (
            <button key={amt} onClick={() => handlePayment(amt)} disabled={loading}>
              {amt} €
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
