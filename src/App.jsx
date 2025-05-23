import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import Swal from 'sweetalert2'
import './App.css'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

function PaymentForm({ amount }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    Swal.fire({
      title: `${amount}€`,
      text: 'Paiement en cours. Ne touchez à rien.',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => Swal.showLoading(),
      background: '#000',
      color: '#fff',
    })

    const res = await fetch('/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    })
    const { clientSecret } = await res.json()

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    })

    if (result.error) {
      Swal.fire('Erreur', result.error.message, 'error')
    } else if (result.paymentIntent.status === 'succeeded') {
      Swal.fire({
        title: 'Exécuté.',
        text: "C'est payé. Tu peux partir maintenant.",
        background: '#000',
        color: '#fff',
        icon: 'success',
        iconColor: '#666',
        confirmButtonColor: '#111',
        confirmButtonText: 'Fermer',
        customClass: {
          popup: 'swal2-dark-popup',
          title: 'swal2-dark-title',
          confirmButton: 'swal2-dark-button',
        },
      })
    }

    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className='payment-form'
    >
      <CardElement
        className='card-element'
        options={{
          style: {
            base: {
              iconColor: '#fff',
              color: '#fff',
              fontSize: '16px',
              fontFamily: 'Inter, sans-serif',
              '::placeholder': {
                color: '#777',
              },
              ':-webkit-autofill': {
                color: '#fff',
              },
            },
            invalid: {
              iconColor: '#ff6b6b',
              color: '#ff6b6b',
            },
          },
        }}
      />
      <button
        type='submit'
        className='btn dom-btn'
        disabled={!stripe || loading}
      >
        Payer {amount}€
      </button>
    </form>
  )
}

function FakeTributes() {
  const [events, setEvents] = useState([])

  const fakeData = [
    { name: 'Anonymous', amount: 50, city: 'Paris' },
    { name: 'Julien', amount: 10, city: 'Lyon' },
    { name: 'Victor', amount: 20, city: 'Genève' },
    { name: 'Marc', amount: 200, city: 'Marseille' },
    { name: 'Lucas', amount: 200, city: 'Toulouse' },
    { name: 'François', amount: 100, city: 'Nantes' },
    { name: 'Damien', amount: 50, city: 'Nice' },
    { name: 'Alex', amount: 200, city: 'Bordeaux' },
  ]

  useEffect(() => {
    // Affiche directement 3 notifs au chargement
    const shuffled = [...fakeData].sort(() => 0.5 - Math.random())
    const initial = shuffled.slice(0, 4).map((entry) => ({
      id: Date.now() + Math.random(),
      ...entry,
    }))

    setEvents(initial)

    // Ensuite, on ajoute régulièrement d'autres notifs
    const getFrequency = () => {
      const hour = new Date().getHours()
      if (hour >= 18 && hour <= 23) return [2000, 4000]
      if (hour >= 10 && hour <= 13) return [3000, 5000]
      return [6000, 9000]
    }

    const launchLoop = () => {
      const [min, max] = getFrequency()
      const delay = Math.random() * (max - min) + min

      const id = setTimeout(() => {
        const newEvent = {
          id: Date.now(),
          ...fakeData[Math.floor(Math.random() * fakeData.length)],
        }

        setEvents((prev) => {
          const updated = [...prev, newEvent]
          return updated.slice(-4) // max 4 visibles
        })

        launchLoop()
      }, delay)

      return () => clearTimeout(id)
    }

    launchLoop()
  }, [])

  return (
    <div className='notif-block'>
      <h2 className='notif-title'>Ils ont obéi.</h2>
      <div className='notif-wrapper'>
        {events.map((e) => (
          <div
            key={e.id}
            className='notif-ios'
          >
            <div className='notif-flex'>
              <div className='notif-name-block'>
                <div className='notif-name'>{e.name}</div>
                <div className='notif-location'>{e.city}</div>
              </div>
              <div className='notif-amount'>{e.amount}€</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [selectedAmount, setSelectedAmount] = useState(null)

  return (
    <div className='container dark'>
      <div className='card dom'>
        <h1 className='dom-title'>Soumets-toi.</h1>
        <p className='dom-sub'>Tu paies. Tu n’existes plus.</p>

        {!selectedAmount ? (
          <div className='buttons'>
            {[5, 10, 20, 50, 100, 500].map((amt) => (
              <button
                key={amt}
                className='btn dom-btn'
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
  )
}

export default App
