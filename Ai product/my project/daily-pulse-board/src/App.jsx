import { useState } from 'react'
import './App.css'

function App() {
  const [mood, setMood] = useState('Happy')
  const [energy, setEnergy] = useState('Medium')
  const [focus, setFocus] = useState('Good')

  return (
    <main className="app">
      <section className="board">
        <p className="eyebrow">Today check-in</p>
        <h1>Daily Pulse Board</h1>
        <p className="intro">
          Select your current mood, energy, and focus level.
        </p>

        <div className="choice-group">
          <h2>Mood</h2>
          <div className="button-row">
            <button onClick={() => setMood('Happy')}>Happy</button>
            <button onClick={() => setMood('Calm')}>Calm</button>
            <button onClick={() => setMood('Tired')}>Tired</button>
          </div>
        </div>

        <div className="choice-group">
          <h2>Energy</h2>
          <div className="button-row">
            <button onClick={() => setEnergy('Low')}>Low</button>
            <button onClick={() => setEnergy('Medium')}>Medium</button>
            <button onClick={() => setEnergy('High')}>High</button>
          </div>
        </div>

        <div className="choice-group">
          <h2>Focus</h2>
          <div className="button-row">
            <button onClick={() => setFocus('Low')}>Low</button>
            <button onClick={() => setFocus('Good')}>Good</button>
            <button onClick={() => setFocus('Deep')}>Deep</button>
          </div>
        </div>

        <div className="summary">
          <h2>Your Daily Pulse</h2>
          <p>Mood: {mood}</p>
          <p>Energy: {energy}</p>
          <p>Focus: {focus}</p>

          {energy === 'High' && <p>You can start a big task today.</p>}
          {energy === 'Low' && <p>Start with a small and easy task.</p>}
          {focus === 'Deep' && <p>This is a good time for focused work.</p>}
        </div>
      </section>
    </main>
  )
}

export default App
