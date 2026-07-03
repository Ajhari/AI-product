import { useState } from 'react'
import './App.css'

const movies = [
  {
    id: 1,
    title: 'Starlight Snacks',
    genre: 'Comedy',
    time: '1h 42m',
    rating: 'PG',
    vibe: 'Light, funny, and easy to watch',
    image:
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 2,
    title: 'Moon Base Mystery',
    genre: 'Sci-Fi',
    time: '2h 08m',
    rating: 'PG-13',
    vibe: 'Space clues and big twists',
    image:
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    title: 'Rainy Street Case',
    genre: 'Thriller',
    time: '1h 55m',
    rating: 'PG-13',
    vibe: 'Dark streets, secrets, and suspense',
    image:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 4,
    title: 'The Last Popcorn',
    genre: 'Comedy',
    time: '1h 35m',
    rating: 'PG',
    vibe: 'Silly friends, fast jokes, cozy ending',
    image:
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    title: 'Castle After Midnight',
    genre: 'Fantasy',
    time: '2h 14m',
    rating: 'PG',
    vibe: 'Magic, courage, and a grand quest',
    image:
      'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 6,
    title: 'Fast Lane Friday',
    genre: 'Action',
    time: '1h 48m',
    rating: 'PG-13',
    vibe: 'Chases, bold plans, and high energy',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id:7,
    title:'karuppu',
    genre:'Action',
    time:'2h 40m',
    rating:'PG-14',
    vibe:'trillerr action,devotional songs',
    image:
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80',
  },
]

const genres = ['All', 'Action', 'Comedy', 'Fantasy', 'Sci-Fi', 'Thriller']
const ratings = ['All', 'PG', 'PG-13', 'PG-14']

function MovieCard({ movie, isSaved, onToggleSave }) {
  return (
    <article className="movie-card">
      <img src={movie.image} alt="" />
      <div className="movie-content">
        <div className="movie-topline">
          <span>{movie.genre}</span>
          <span>{movie.time}</span>
        </div>
        <h2>{movie.title}</h2>
        <p>{movie.vibe}</p>
        <div className="movie-footer">
          <span className="rating">{movie.rating}</span>
          <button type="button" onClick={() => onToggleSave(movie.id)}>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [searchText, setSearchText] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [savedMovieIds, setSavedMovieIds] = useState([])
  const [selectedRating, setSelectedRating] = useState('All')

  const filteredMovies = movies.filter((movie) => {
    const matchesSearch = movie.title
      .toLowerCase()
      .includes(searchText.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || movie.genre === selectedGenre
    const matchesRating =
      selectedRating === 'All' || movie.rating === selectedRating

    return matchesSearch && matchesGenre && matchesRating
  })
  

  const savedMovies = movies.filter((movie) => savedMovieIds.includes(movie.id))

  function handleToggleSave(movieId) {
    if (savedMovieIds.includes(movieId)) {
      setSavedMovieIds(savedMovieIds.filter((id) => id !== movieId))
    } else {
      setSavedMovieIds([...savedMovieIds, movieId])
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Weekend watchlist</p>
          <h1>Movie Night Planner</h1>
          <p className="hero-copy">
            Browse a mock movie list, search by title, filter by genre, and save
            a short list for later.
          </p>
        </div>

        <div className="shortlist-box">
          <span>Shortlist</span>
          <strong>{savedMovies.length}</strong>
          <p>{savedMovies.length === 1 ? 'movie saved' : 'movies saved'}</p>
        </div>
      </section>

      <section className="controls-panel">
        <label>
          Search movies
          <input
            type="text"
            placeholder="Try comedy or moon..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>

        <div className="genre-buttons" aria-label="Filter by genre">
          {genres.map((genre) => (
            <button
              key={genre}
              type="button"
              className={selectedGenre === genre ? 'active' : ''}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <div className="genre-buttons" aria-label="Filter by rating">
          {ratings.map((rating) => (
            <button
              key={rating}
              type="button"
              className={selectedRating === rating ? 'active' : ''}
              onClick={() => setSelectedRating(rating)}
            >
              {rating}
            </button>
          ))}
        </div>
      </section>

      {filteredMovies.length > 0 ? (
        <>
        <p className="result-count">{filteredMovies.length} movies found</p>

        <section className="movie-grid">
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              isSaved={savedMovieIds.includes(movie.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </section>
      </>
      ) : (
        <section className="empty-state">
          <h2>No movies found</h2>
          <p>Try a different search word or choose another genre.</p>
        </section>
      )}

      <section className="saved-panel">
        <h2>Your shortlist</h2>
        {savedMovies.length > 0 ? (
          <ul>
            {savedMovies.map((movie) => (
              <li key={movie.id}>
                <span>{movie.title}</span>
                <button type="button" onClick={() => handleToggleSave(movie.id)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Save a movie to build your plan.</p>
        )}
      </section>
    </main>
  )
}

export default App
