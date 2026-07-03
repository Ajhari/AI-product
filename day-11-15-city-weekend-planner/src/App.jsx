import { useEffect, useState } from 'react'
import { places } from './data/places'
import './App.css'

const categories = ['All', 'Outdoor', 'Food', 'Culture', 'Shopping']
const budgets = ['All', 'Free', 'Low', 'Medium', 'High']
const sortOptions = [
  { value: 'rating-desc', label: 'Rating: high to low' },
  { value: 'rating-asc', label: 'Rating: low to high' },
  { value: 'name-asc', label: 'Name: A to Z' },
]
const savedPlanStorageKey = 'city-weekend-planner-saved-plan'

function loadSavedPlan() {
  const savedValue = localStorage.getItem(savedPlanStorageKey)

  if (savedValue) {
    return JSON.parse(savedValue)
  }

  return []
}

function App() {
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBudget, setSelectedBudget] = useState('All')
  const [selectedSort, setSelectedSort] = useState('rating-desc')
  const [savedPlan, setSavedPlan] = useState(loadSavedPlan)

  const filteredPlaces = places.filter((place) => {
    const matchesSearch = place.name
      .toLowerCase()
      .includes(searchText.toLowerCase())
    const matchesCategory =
      selectedCategory === 'All' || place.category === selectedCategory
    const matchesBudget =
      selectedBudget === 'All' || place.budget === selectedBudget

    return matchesSearch && matchesCategory && matchesBudget
  })

  const sortedPlaces = [...filteredPlaces].sort((firstPlace, secondPlace) => {
    if (selectedSort === 'rating-desc') {
      return secondPlace.rating - firstPlace.rating
    }

    if (selectedSort === 'rating-asc') {
      return firstPlace.rating - secondPlace.rating
    }

    return firstPlace.name.localeCompare(secondPlace.name)
  })

  const savedPlaces = savedPlan
    .map((item) => places.find((place) => place.id === item.placeId))
    .filter(Boolean)

  const savedBudgetSummary = budgets
    .filter((budget) => budget !== 'All')
    .map((budget) => ({
      budget: budget,
      count: savedPlaces.filter((place) => place.budget === budget).length,
    }))
    .filter((item) => item.count > 0)

  useEffect(() => {
    localStorage.setItem(savedPlanStorageKey, JSON.stringify(savedPlan))
  }, [savedPlan])

  function handleToggleSave(placeId) {
    const isAlreadySaved = savedPlan.some((item) => item.placeId === placeId)

    if (isAlreadySaved) {
      setSavedPlan(savedPlan.filter((item) => item.placeId !== placeId))
    } else {
      setSavedPlan([...savedPlan, { placeId: placeId, note: '' }])
    }
  }

  function handleResetFilters() {
    setSearchText('')
    setSelectedCategory('All')
    setSelectedBudget('All')
    setSelectedSort('rating-desc')
  }

  function handleNoteChange(placeId, note) {
    setSavedPlan(
      savedPlan.map((item) =>
        item.placeId === placeId ? { ...item, note: note } : item,
      ),
    )
  }

  return (
    <main className="app">
      <section className="top-section">
        <div>
          <p className="eyebrow">Week 3 project</p>
          <h1>City Weekend Planner</h1>
          <p className="intro">
            Explore city options, filter the list, and start saving a weekend
            plan.
          </p>
        </div>

        <div className="summary-box" aria-label="Plan summary" aria-live="polite">
          <span>{savedPlan.length}</span>
          saved places
        </div>
      </section>

      <section className="plan-summary" aria-label="Saved plan details">
        <div>
          <h2>Saved summary</h2>
          <p>
            Your saved places and notes stay in this browser after refresh.
          </p>
        </div>

        {savedBudgetSummary.length > 0 ? (
          <ul>
            {savedBudgetSummary.map((item) => (
              <li key={item.budget}>
                <span>{item.budget}</span>
                <strong>{item.count}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted-text">Save a place to see budget counts.</p>
        )}
      </section>

      <section className="filters" aria-label="Place filters">
        <label>
          Search places
          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Try food, museum, garden..."
          />
        </label>

        <label>
          Category
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label>
          Budget
          <select
            value={selectedBudget}
            onChange={(event) => setSelectedBudget(event.target.value)}
          >
            {budgets.map((budget) => (
              <option key={budget} value={budget}>
                {budget}
              </option>
            ))}
          </select>
        </label>

        <label>
          Sort
          <select
            value={selectedSort}
            onChange={(event) => setSelectedSort(event.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="ghost-button"
          onClick={handleResetFilters}
        >
          Reset
        </button>
      </section>

      <p className="result-count" aria-live="polite">
        Showing {sortedPlaces.length} of {places.length} places
      </p>

      <section className="places-grid" aria-label="City options">
        {sortedPlaces.map((place) => {
          const savedItem = savedPlan.find((item) => item.placeId === place.id)
          const isSaved = Boolean(savedItem)

          return (
            <article className="place-card" key={place.id}>
              <div className="card-header">
                <div>
                  <p className="tag">{place.category}</p>
                  <h2>{place.name}</h2>
                </div>
                <span className="rating">{place.rating}</span>
              </div>

              <p>{place.description}</p>

              <div className="meta-row">
                <span>{place.area}</span>
                <span>{place.budget}</span>
                <span>{place.time}</span>
              </div>

              <button
                type="button"
                className={isSaved ? 'save-button saved' : 'save-button'}
                onClick={() => handleToggleSave(place.id)}
                aria-pressed={isSaved}
              >
                {isSaved ? 'Saved' : 'Save to plan'}
              </button>

              {isSaved && (
                <label className="note-field">
                  Plan note
                  <textarea
                    value={savedItem.note}
                    onChange={(event) =>
                      handleNoteChange(place.id, event.target.value)
                    }
                    placeholder="Add timing, booking, or travel notes..."
                  />
                </label>
              )}
            </article>
          )
        })}
      </section>

      {sortedPlaces.length === 0 && (
        <div className="empty-state" role="status">
          <p>No places match these filters yet.</p>
          <button
            type="button"
            className="ghost-button"
            onClick={handleResetFilters}
          >
            Clear filters
          </button>
        </div>
      )}
    </main>
  )
}

export default App
