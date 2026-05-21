import { useState } from 'react'
import './App.css'

const activities = [
  { id: 1, name: 'Movie Night', emoji: '🎬' },
  { id: 2, name: 'Beach Walk', emoji: '🏖️' },
  { id: 3, name: 'Cafe Hangout', emoji: '☕' },
  { id: 4, name: 'Game Evening', emoji: '🎮' },
]

function ActivityCard({ activity, votes, onVote, isLeader }) {
  return (
    <div className={isLeader ? 'activity-card leader-card' : 'activity-card'}>
      <div className="activity-emoji">{activity.emoji}</div>
      <h2>{activity.name}</h2>
      <p>{votes} votes</p>
      <button type="button" onClick={() => onVote(activity.id)}>
        Vote
      </button>
    </div>
  )
}

function App() {
  const [votes, setVotes] = useState({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  })

  function handleVote(activityId) {
    setVotes({
      ...votes,
      [activityId]: votes[activityId] + 1,
    })
  }

  const leader = activities.reduce((topActivity, activity) => {
    if (votes[activity.id] > votes[topActivity.id]) {
      return activity
    }

    return topActivity
  }, activities[0])

  const leaderVotes = votes[leader.id]

  return (
    <main className="app">
      <section className="poll-header">
        <p className="label">Weekend Activity Poll</p>
        <h1>Choose this weekend's plan</h1>
        <p className="leader-text">
          {leaderVotes === 0
            ? 'No votes yet. Be the first to vote!'
            : `Current leader: ${leader.name} with ${leaderVotes} votes`}
        </p>
      </section>

      <section className="activity-grid">
        {activities.map((activity) => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            votes={votes[activity.id]}
            onVote={handleVote}
            isLeader={leaderVotes > 0 && activity.id === leader.id}
          />
        ))}
      </section>
    </main>
  )
}

export default App
