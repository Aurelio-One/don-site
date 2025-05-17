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
      text: "Paiement en cours. Bouge pas.",
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
      Swal.fire({
        title: "Exécuté.",
        text: "C'est payé. Tu peux disparaître.",
        background: "#000",
        color: "#fff",
        icon: "success",
        iconColor: "#666",
        confirmButtonColor: "#111",
        confirmButtonText: "Fermer",
        customClass: {
          popup: "swal2-dark-popup",
          title: "swal2-dark-title",
          confirmButton: "swal2-dark-button",
        }
      });
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <CardElement
        className="card-element"
        options={{
          style: {
            base: {
              iconColor: "#fff",
              color: "#fff",
              fontSize: "16px",
              fontFamily: "Inter, sans-serif",
              "::placeholder": {
                color: "#777",
              },
              ":-webkit-autofill": {
                color: "#fff",
              },
            },
            invalid: {
              iconColor: "#ff6b6b",
              color: "#ff6b6b",
            },
          },
        }}
      />
      <button type="submit" className="btn dom-btn" disabled={!stripe || loading}>
        Payer {amount}€
      </button>
    </form>
  );
}

function FakeTributes() {
  const [events, setEvents] = useState([]);

  const fakeData = [
    "Anonyme - 50€ - Paris",
    "Julien - 10€ - Lyon",
    "Anonyme - 100€ - Bruxelles",
    "Victor - 20€ - Genève",
    "Marc - 200€ - Marseille",
    "Anonyme - 75€ - Montréal",
    "Lucas - 30€ - Toulouse",
    "François - 60€ - Nantes",
    "Anonyme - 15€ - Berlin",
    "Damien - 25€ - Nice"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = fakeData[Math.floor(Math.random() * fakeData.length)];
      setEvents((prev) => [...prev.slice(-4), newEvent]);
    }, Math.random() * 8000 + 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fake-tributes">
      {events.map((e, i) => (
        <div key={i} className="tribute-notif">
          <span className="notif-dot" /> {e}
        </div>
      ))}
    </div>
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

        <FakeTributes />
      </div>
    </div>
  );
}

export default App;
