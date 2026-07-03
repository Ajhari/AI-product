import { useState } from 'react'
import './App.css'

const trailers = [
  {
    id: 1,
    title: 'Denmark city',
    genre: 'Sci-fi Action',
    posterText: 'NV 😎',
    description: 'A night race across a futuristic city decides who saves the crew.',
  },
  {
    id: 2,
    title: 'Final Frame',
    genre: 'Mystery Thriller',
    posterText: 'FF 🙃',
    description: 'A director finds a hidden clue inside the last scene of a lost film.',
  },
]

function TrailerCard({ trailer, votes, onVote, isLeader }) {
  return (
    <article className={isLeader ? 'trailer-card leader-card' : 'trailer-card'}>
      <div className="poster">{trailer.posterText}</div>
      <p className="genre">{trailer.genre}</p>
      <h2>{trailer.title}</h2>
      <p>{trailer.description}</p>
      <strong>{votes} votes</strong>
      <button onClick={() => onVote(trailer.id)}>Vote</button>
    </article>
  )
}

function App() {
  const [votes, setVotes] = useState({
    1: 0,
    2: 0,
  })

  function handleVote(id) {
    setVotes({
      ...votes,
      [id]: votes[id] + 1,
    })
  }

  const leader = trailers.find((trailer) => votes[trailer.id] === Math.max(...Object.values(votes)))
  const isTie = votes[1] === votes[2]

  return (
    <main className="app">
      <section className="intro">
        <p className="eyebrow">Trailer Showdown</p>
        <h1>Pick the trailer you would watch first.</h1>
        <p>Vote between two modern trailer ideas and check the current leader.</p>
      </section>

      <section className="leader-panel">
        <span>Current leader</span>
        <strong>{isTie ? 'It is a tie' : leader.title}</strong>
      </section>

      <section className="trailer-grid">
        {trailers.map((trailer) => (
          <TrailerCard
            key={trailer.id}
            trailer={trailer}
            votes={votes[trailer.id]}
            onVote={handleVote}
            isLeader={!isTie && leader.id === trailer.id}
          />
        ))}
      </section>
    </main>
  )
}

export default App
