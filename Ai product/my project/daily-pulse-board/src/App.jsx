import { useState } from 'react'
import './App.css'

const moodEmoji = {
  Happy: '\u{1F60A}',
  Calm: '\u{1F60C}',
  Tired: '\u{1F634}',
  Exciting: '\u{1F929}',
}

function App() {
  const [mood, setMood] = useState('Happy')
  const [energy, setEnergy] = useState('Medium')
  const [focus, setFocus] = useState('Good')

  return (
    <main className={`app app-${mood.toLowerCase()}`}>
      <section className="board">
        <p className="eyebrow">Today check-in</p>
        <h1>Daily Pulse Board</h1>
        <p className="intro">
          Select your current mood, energy, and focus level.
        </p>

        <div className="mood-display">
          <span className="mood-icon">{moodEmoji[mood]}</span>
          <div>
            <p className="label">Current mood</p>
            <strong>{mood}</strong>
          </div>
        </div>

        <div className="choice-group">
          <h2>Mood</h2>
          <div className="button-row">
            <button className={mood === 'Happy' ? 'active' : ''} onClick={() => setMood('Happy')}>
              {moodEmoji.Happy} Happy
            </button>
            <button className={mood === 'Calm' ? 'active' : ''} onClick={() => setMood('Calm')}>
              {moodEmoji.Calm} Calm
            </button>
            <button className={mood === 'Tired' ? 'active' : ''} onClick={() => setMood('Tired')}>
              {moodEmoji.Tired} Tired
            </button>
            <button className={mood === 'Exciting' ? 'active' : ''} onClick={() => setMood('Exciting')}>
              {moodEmoji.Exciting} Exciting
            </button>
          </div>
        </div>

        <div className="choice-group">
          <h2>Energy</h2>
          <div className="button-row">
            <button className={energy === 'Low' ? 'active' : ''} onClick={() => setEnergy('Low')}>Low</button>
            <button className={energy === 'Medium' ? 'active' : ''} onClick={() => setEnergy('Medium')}>Medium</button>
            <button className={energy === 'High' ? 'active' : ''} onClick={() => setEnergy('High')}>High</button>
          </div>
        </div>

        <div className="choice-group">
          <h2>Focus</h2>
          <div className="button-row">
            <button className={focus === 'Low' ? 'active' : ''} onClick={() => setFocus('Low')}>Low</button>
            <button className={focus === 'Good' ? 'active' : ''} onClick={() => setFocus('Good')}>Good</button>
            <button className={focus === 'Deep' ? 'active' : ''} onClick={() => setFocus('Deep')}>Deep</button>
          </div>
        </div>

        <div className="summary">
          <h2>Your Daily Pulse</h2>
          <p>Mood: {moodEmoji[mood]} {mood}</p>
          <p>Energy: {energy}</p>
          <p>Focus: {focus}</p>

          {mood === 'Happy' && <p>Your mood feels bright today.</p>}
          {mood === 'Calm' && <p>A calm mood is good for steady work.</p>}
          {mood === 'Tired' && <p>Take it slow and begin with a small task.</p>}
          {mood === 'Exciting' && <p>You have strong energy to try something new.</p>}
        </div>
      </section>
    </main>
  )
}

export default App
