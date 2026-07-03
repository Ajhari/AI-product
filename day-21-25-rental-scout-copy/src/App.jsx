import { useState } from 'react'
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useParams,
} from 'react-router-dom'
import { rentals } from './data/rentals'
import './App.css'

function App() {
  const [savedIds, setSavedIds] = useState([])

  function toggleSaved(id) {
    setSavedIds((currentIds) =>
      currentIds.includes(id)
        ? currentIds.filter((savedId) => savedId !== id)
        : [...currentIds, id],
    )
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/">Rental Scout</Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/">Browse</NavLink>
          <NavLink to="/saved">Saved ({savedIds.length})</NavLink>
        </nav>
      </header>

      <main>
        <Routes>
          <Route
            path="/"
            element={<BrowsePage savedIds={savedIds} onToggleSaved={toggleSaved} />}
          />
          <Route
            path="/saved"
            element={<SavedPage savedIds={savedIds} onToggleSaved={toggleSaved} />}
          />
          <Route
            path="/rentals/:rentalId"
            element={<DetailsPage savedIds={savedIds} onToggleSaved={toggleSaved} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function BrowsePage({ savedIds, onToggleSaved }) {
  const [searchText, setSearchText] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [maxRent, setMaxRent] = useState('all')

  const filteredRentals = rentals.filter((rental) => {
    const matchesSearch =
      rental.title.toLowerCase().includes(searchText.toLowerCase()) ||
      rental.location.toLowerCase().includes(searchText.toLowerCase())
    const matchesType = selectedType === 'all' || rental.type === selectedType
    const matchesRent = maxRent === 'all' || rental.rent <= Number(maxRent)

    return matchesSearch && matchesType && matchesRent
  })

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="eyebrow">Browse rentals</p>
        <h1>Find a place that matches your interest.</h1>
      </div>

      <div className="filters" aria-label="Rental filters">
        <label>
          Search
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Try Adyar or studio"
          />
        </label>

        <label>
          Type
          <select
            value={selectedType}
            onChange={(event) => setSelectedType(event.target.value)}
          >
            <option value="all">All types</option>
            <option value="Apartment">Apartment</option>
            <option value="Studio">Studio</option>
            <option value="Villa">Villa</option>
          
          </select>
        </label>

        <label>
          Max rent
          <select value={maxRent} onChange={(event) => setMaxRent(event.target.value)}>
            <option value="all">Any price</option>
            <option value="18000">Up to Rs.18,000</option>
            <option value="25000">Up to Rs.25,000</option>
            <option value="35000">Up to Rs.35,000</option>
          </select>
        </label>
      </div>

      <RentalGrid
        rentalsToShow={filteredRentals}
        savedIds={savedIds}
        onToggleSaved={onToggleSaved}
      />
    </section>
  )
}

function SavedPage({ savedIds, onToggleSaved }) {
  const savedRentals = rentals.filter((rental) => savedIds.includes(rental.id))

  return (
    <section className="page-section">
      <div className="page-heading">
        <p className="eyebrow">Saved homes</p>
        <h1>Your shortlist.</h1>
      </div>

      {savedRentals.length > 0 ? (
        <RentalGrid
          rentalsToShow={savedRentals}
          savedIds={savedIds}
          onToggleSaved={onToggleSaved}
        />
      ) : (
        <div className="empty-state">
          <h2>No saved rentals yet</h2>
          <p>Go back to browse and save one rental you like.</p>
          <Link className="primary-link" to="/">Browse rentals</Link>
        </div>
      )}
    </section>
  )
}

function DetailsPage({ savedIds, onToggleSaved }) {
  const { rentalId } = useParams()
  const rental = rentals.find((item) => item.id === rentalId)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  if (!rental) {
    return (
      <section className="page-section">
        <div className="empty-state">
          <h1>Rental not found</h1>
          <Link className="primary-link" to="/">Back to browse</Link>
        </div>
      </section>
    )
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitted(true)
  }

  const isSaved = savedIds.includes(rental.id)

  return (
    <section className="details-page">
      <div className="details-panel">
        <Link className="back-link" to="/">Back to browse</Link>
        <img src={rental.imageUrl} alt={rental.title} />
        <div className="details-content">
          <p className="eyebrow">{rental.type} in {rental.location}</p>
          <h1>{rental.title}</h1>
          <p className="price">Rs.{rental.rent.toLocaleString('en-IN')} / month</p>
          <p>{rental.description}</p>
          <ul className="features">
            {rental.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
          <button type="button" onClick={() => onToggleSaved(rental.id)}>
            {isSaved ? 'Remove from saved' : 'Save rental'}
          </button>
        </div>
      </div>

      <form className="inquiry-form" onSubmit={handleSubmit}>
        <h2>Inquiry form</h2>
        <label>
          Your name
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Phone
          <input
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Message
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows="4"
            required
          />
        </label>
        <button type="submit">Send inquiry</button>
        {isSubmitted && (
          <p className="success-message">
            Inquiry sent for {rental.title}. This is a frontend-only confirmation.
          </p>
        )}
      </form>
    </section>
  )
}

function RentalGrid({ rentalsToShow, savedIds, onToggleSaved }) {
  if (rentalsToShow.length === 0) {
    return (
      <div className="empty-state">
        <h2>No rentals match these filters</h2>
        <p>Try changing the search, type, or price filter.</p>
      </div>
    )
  }

  return (
    <div className="rental-grid">
      {rentalsToShow.map((rental) => (
        <RentalCard
          key={rental.id}
          rental={rental}
          isSaved={savedIds.includes(rental.id)}
          onToggleSaved={onToggleSaved}
        />
      ))}
    </div>
  )
}

function RentalCard({ rental, isSaved, onToggleSaved }) {
  return (
    <article className="rental-card">
      <img src={rental.imageUrl} alt={rental.title} />
      <div className="card-content">
        <div>
          <p className="eyebrow">{rental.type}</p>
          <h2>{rental.title}</h2>
          <p>{rental.location}</p>
        </div>
        <p className="price">Rs.{rental.rent.toLocaleString('en-IN')} / month</p>
        <div className="card-actions">
          <Link className="primary-link" to={`/rentals/${rental.id}`}>View details</Link>
          <button type="button" onClick={() => onToggleSaved(rental.id)}>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default App
