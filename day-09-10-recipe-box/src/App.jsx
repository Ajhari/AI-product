import { useEffect, useState } from 'react'
import './App.css'

const starterRecipes = [
  {
    id: 1,
    name: 'chicken sandwich',
    category: 'breakfast',
    time: 15,
    isFavorite: false,
  },
  {
    id: 2,
    name: 'curd rice',
    category: 'lunch',
    time: 25,
    isFavorite: false,
  },
  {
    id: 3,
    name: 'chapathi',
    category: 'dinner',
    time: 30,
    isFavorite: false,
  },
]

function loadRecipes() {
  const savedRecipes = localStorage.getItem('recipe-box-recipes')

  if (savedRecipes) {
    return JSON.parse(savedRecipes)
  }

  return starterRecipes
}

function RecipeForm({ onAddRecipe }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('breakfast')
  const [time, setTime] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const cookingTime = Number(time)

    if (name.trim() === '' || cookingTime <= 0) {
      return
    }

    onAddRecipe({
      id: Date.now(),
      name: name.trim(),
      category,
      time: cookingTime,
      isFavorite: false,
    })

    setName('')
    setCategory('breakfast')
    setTime('')
  }

  return (
    <form className="recipe-form" onSubmit={handleSubmit}>
      <label>
        Recipe name
        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Idly"
        />
      </label>

      <label>
        Category
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </label>

      <label>
        Cooking time
        <input
          type="number"
          value={time}
          onChange={(event) => setTime(event.target.value)}
          placeholder="Minutes"
          min="1"
        />
      </label>

      <button type="submit">Add recipe</button>
    </form>
  )
}

function Summary({ recipes }) {
  const totalTime = recipes.reduce((sum, recipe) => sum + recipe.time, 0)
  const averageTime =
    recipes.length === 0 ? 0 : Math.round(totalTime / recipes.length)
  const favoriteCount = recipes.filter((recipe) => recipe.isFavorite).length

  return (
    <section className="summary">
      <div>
        <span>Total recipes</span>
        <strong>{recipes.length}</strong>
      </div>
      <div>
        <span>Average time</span>
        <strong>{averageTime} min</strong>
      </div>
      <div>
        <span>Favorites</span>
        <strong>{favoriteCount}</strong>
      </div>
    </section>
  )
}

function RecipeList({ title, recipes, onDeleteRecipe, onToggleFavorite }) {
  return (
    <section className="recipe-section">
      <h2>{title}</h2>

      {recipes.length === 0 ? (
        <p className="empty">No recipes yet.</p>
      ) : (
        <ul>
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <span>{recipe.name}</span>
              <small>{recipe.time} min</small>
              <button
                type="button"
                className={recipe.isFavorite ? 'favorite active' : 'favorite'}
                onClick={() => onToggleFavorite(recipe.id)}
              >
                {recipe.isFavorite ? 'Favorited' : 'Favorite'}
              </button>
              <button type="button" onClick={() => onDeleteRecipe(recipe.id)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function BreakfastRecipes({ recipes, onDeleteRecipe, onToggleFavorite }) {
  return (
    <RecipeList
      title="Breakfast"
      recipes={recipes}
      onDeleteRecipe={onDeleteRecipe}
      onToggleFavorite={onToggleFavorite}
    />
  )
}

function LunchRecipes({ recipes, onDeleteRecipe, onToggleFavorite }) {
  return (
    <RecipeList
      title="Lunch"
      recipes={recipes}
      onDeleteRecipe={onDeleteRecipe}
      onToggleFavorite={onToggleFavorite}
    />
  )
}

function DinnerRecipes({ recipes, onDeleteRecipe, onToggleFavorite }) {
  return (
    <RecipeList
      title="Dinner"
      recipes={recipes}
      onDeleteRecipe={onDeleteRecipe}
      onToggleFavorite={onToggleFavorite}
    />
  )
}

function App() {
  const [recipes, setRecipes] = useState(loadRecipes)

  useEffect(() => {
    localStorage.setItem('recipe-box-recipes', JSON.stringify(recipes))
  }, [recipes])

  const breakfastRecipes = recipes.filter(
    (recipe) => recipe.category === 'breakfast',
  )
  const lunchRecipes = recipes.filter((recipe) => recipe.category === 'lunch')
  const dinnerRecipes = recipes.filter((recipe) => recipe.category === 'dinner')

  function handleAddRecipe(newRecipe) {
    setRecipes([...recipes, newRecipe])
  }

  function handleDeleteRecipe(id) {
    setRecipes(recipes.filter((recipe) => recipe.id !== id))
  }

  function handleToggleFavorite(id) {
    setRecipes(
      recipes.map((recipe) =>
        recipe.id === id
          ? { ...recipe, isFavorite: !recipe.isFavorite }
          : recipe,
      ),
    )
  }

  function handleResetRecipes() {
    setRecipes(starterRecipes)
  }

  return (
    <main className="app">
      <header>
        <p>Week 2 Days 9-10</p>
        <h1>Recipe Box</h1>
      </header>

      <RecipeForm onAddRecipe={handleAddRecipe} />
      <Summary recipes={recipes} />

      <div className="recipe-grid">
        <BreakfastRecipes
          recipes={breakfastRecipes}
          onDeleteRecipe={handleDeleteRecipe}
          onToggleFavorite={handleToggleFavorite}
        />
        <LunchRecipes
          recipes={lunchRecipes}
          onDeleteRecipe={handleDeleteRecipe}
          onToggleFavorite={handleToggleFavorite}
        />
        <DinnerRecipes
          recipes={dinnerRecipes}
          onDeleteRecipe={handleDeleteRecipe}
          onToggleFavorite={handleToggleFavorite}
        />
      </div>

      <button className="reset-button" type="button" onClick={handleResetRecipes}>
        Reset starter recipes
      </button>
    </main>
  )
}

export default App
