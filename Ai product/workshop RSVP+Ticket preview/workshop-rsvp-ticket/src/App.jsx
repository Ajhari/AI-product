import { useState } from 'react'
import './App.css'

const emptyForm = {
  name: '',
  email: '',
  workshop: 'React Basics',
  seatType:'',//<--add this line
}

function App() {
  const [formData, setFormData] = useState(emptyForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleChange(event) {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (formData.name.trim() === '' || formData.email.trim() === '') {
      setError('Please enter your name and email.')
      setSuccess('')
      return
    }

    setSuccess(`Ticket created for ${formData.name}!`)
    setError('')
    setFormData(emptyForm)
  }

  return (
    <main className="app">
      <section className="form-panel">
        <p className="eyebrow">Workshop RSVP</p>
        <h1>Create your attendee pass</h1>

        <form onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ananya Kumar"
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ananya@example.com"
            />
          </label>

          <label>
            Workshop
            <select
              name="workshop"
              value={formData.workshop}
              onChange={handleChange}
            >
              <option>React Basics</option>
              <option>UI Design Lab</option>
              <option>JavaScript Practice</option>
            </select>
          </label>
          <label>
            seat type
            <input
            type="text"
            name="seatType"
            value={formData.seatType}
            onChange={handleChange}
            />
          </label>

          <button type="submit">Generate ticket</button>
        </form>

        {error && <p className="message error">{error}</p>}
        {success && <p className="message success">{success}</p>}
      </section>

      <section className="ticket-panel" aria-label="Live ticket preview">
        <div className="ticket">
          <div>
            <p className="ticket-label">Attendee</p>
            <h2>{formData.name || 'Your name'}</h2>
          </div>

          <div>
            <p className="ticket-label">Email</p>
            <p>{formData.email || 'your@email.com'}</p>
          </div>

          <div>
            <p className="ticket-label">Workshop</p>
            <p>{formData.workshop}</p>
          </div>
          <div>
            <p className="ticket-label">seatType</p>
            <p>{formData.seatType || 'seat type'}</p>
          </div>

          <p className="ticket-code">PASS-2026</p>
        </div>
      </section>
    </main>
  )
}

export default App
