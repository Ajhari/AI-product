import { useState } from 'react'
import './App.css'

const playlistOptions = [
  {
    id: 1,
    title: 'DARK NIGHT',
    mood: 'COOL,CALM AND LATE NIGHT VIBES',
    emoji: 'Night',
  },
  {
    id: 2,
    title: 'BRIGHT MORNING',
    mood: 'FRESH,ENERGETIC AND POSITIVE VIBES',
    emoji: 'Morning',
  },
  {
    id: 3,
    title: 'MID AFTERNOON',
    mood: 'RELAX AND HAPPY VIBES',
    emoji: 'Afternoon',
  }
  
]

function PlaylistCard({ playlist, votes, onVote, isLeader }) {
  return (
    <article className={isLeader ? 'playlist-card leader-card' : 'playlist-card'}>
      <div className="playlist-emoji">{playlist.emoji}</div>
      <h2>{playlist.title}</h2>
      <p>{playlist.mood}</p>
      <strong>{votes} votes</strong>
      <button type="button" onClick={() => onVote(playlist.id)}>
        Vote for this playlist
      </button>
    </article>
  )
}

function App() {
  const [votes, setVotes] = useState({
    1: 0,
    2: 0,
    3: 0,
  })

  const firstVotes = votes[playlistOptions[0].id]
  const secondVotes = votes[playlistOptions[1].id]
  const thirdVotes = votes[playlistOptions[2].id]

  let leader = null

  if (firstVotes > secondVotes && firstVotes > thirdVotes) {
    leader = playlistOptions[0]
  } else if (secondVotes > firstVotes && secondVotes > thirdVotes) {
    leader = playlistOptions[1]
  } else if (thirdVotes > firstVotes && thirdVotes > secondVotes) {
    leader = playlistOptions[2]
  }

  function handleVote(playlistId) {
    setVotes({
      ...votes,
      [playlistId]: votes[playlistId] + 1,
    })
  }

  return (
    <main className="app">
      <section className="intro">
        <p className="eyebrow">Playlist Duel</p>
        <h1>Pick the playlist that wins the room.</h1>
        <p>
          Choose between two modern playlist ideas. The app updates the current
          leader after every vote.
        </p>
      </section>

      <section className="duel-board">
        {playlistOptions.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            playlist={playlist}
            votes={votes[playlist.id]}
            onVote={handleVote}
            isLeader={leader?.id === playlist.id}
          />
        ))}
      </section>

      <section className="leader-box">
        <p>Current leader</p>
        <h2>{leader ? leader.title : 'It is a tie'}</h2>
      </section>
    </main>
  )
}

export default App
