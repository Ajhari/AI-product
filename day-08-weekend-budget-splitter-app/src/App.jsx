import { useState } from 'react'
import ExpenseCount from './components/ExpenseCount.jsx'
import './App.css'

const formatMoney = (amount) =>
  amount.toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  })

const expenseOptions = [
  'TRAVEL',
  'FOOD',
  'HOTEL STAY',
  'THEME PARK TICKET',
  'SNACKS',
]

const foodTypeOptions = ['BREAKFAST', 'LUNCH', 'DINNER']

function App() {
  const [budgetForm, setBudgetForm] = useState({
    expenses: [],
    expenseName: '',
    expenseAmount: '',
    foodType: '',
    tripName: 'Beach weekend',
    peopleCount: 3,
    error: '',
  })

  const total = budgetForm.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )
  const foodSubtotal = budgetForm.expenses
    .filter((expense) => expense.name === 'FOOD')
    .reduce((sum, expense) => sum + expense.amount, 0)
  const splitAmount =
    budgetForm.peopleCount > 0 ? total / budgetForm.peopleCount : 0

  function handleAddExpense(event) {
    event.preventDefault()

    const parsedAmount = Number(budgetForm.expenseAmount)
    const trimmedName = budgetForm.expenseName.trim()

    if (trimmedName === '') {
      setBudgetForm({
        ...budgetForm,
        error: 'Please enter an expense name.',
      })
      return
    }

    if (trimmedName === 'FOOD' && budgetForm.foodType === '') {
      setBudgetForm({
        ...budgetForm,
        error: 'Please select breakfast, lunch, or dinner.',
      })
      return
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setBudgetForm({
        ...budgetForm,
        error: 'Please enter an amount greater than 0.',
      })
      return
    }

    const newExpense = {
      id: Date.now(),
      name: trimmedName,
      foodType: trimmedName === 'FOOD' ? budgetForm.foodType : '',
      amount: parsedAmount,
    }

    setBudgetForm({
      ...budgetForm,
      expenses: [...budgetForm.expenses, newExpense],
      expenseName: '',
      expenseAmount: '',
      foodType: '',
      error: '',
    })
  }

  function handleDeleteExpense(id) {
    const updatedExpenses = budgetForm.expenses.filter(
      (expense) => expense.id !== id,
    )
    setBudgetForm({
      ...budgetForm,
      expenses: updatedExpenses,
    })
  }

  return (
    <main className="app">
      <section className="intro">
        <p className="eyebrow">Weekend plan</p>
        <h1>{budgetForm.tripName || 'Budget Splitter'}</h1>
        <p className="introText">
          Add each shared expense, then check the total and per-person split.
        </p>
      </section>

      <section className="layout">
        <form className="panel formPanel" onSubmit={handleAddExpense}>
          <h2>Add expense</h2>

          <label>
            Trip name
            <input
              type="text"
              value={budgetForm.tripName}
              onChange={(event) =>
                setBudgetForm({
                  ...budgetForm,
                  tripName: event.target.value,
                })
              }
              placeholder="Beach weekend"
            />
          </label>

          <label>
            Expense name
            <select
              value={budgetForm.expenseName}
              onChange={(event) => {
                setBudgetForm({
                  ...budgetForm,
                  expenseName: event.target.value,
                  foodType: '',
                })
              }}
            >
              <option value="">Select expense</option>
              {expenseOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {budgetForm.expenseName === 'FOOD' && (
            <label>
              Type of food
              <select
                value={budgetForm.foodType}
                onChange={(event) =>
                  setBudgetForm({
                    ...budgetForm,
                    foodType: event.target.value,
                  })
                }
              >
                <option value="">Select food type</option>
                {foodTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label>
            Amount
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetForm.expenseAmount}
              onChange={(event) =>
                setBudgetForm({
                  ...budgetForm,
                  expenseAmount: event.target.value,
                })
              }
              placeholder="500"
            />
          </label>

          <label>
            Number of people
            <input
              type="number"
              min="1"
              value={budgetForm.peopleCount}
              onChange={(event) =>
                setBudgetForm({
                  ...budgetForm,
                  peopleCount: Number(event.target.value),
                })
              }
            />
          </label>

          {budgetForm.error && <p className="error">{budgetForm.error}</p>}

          <button type="submit">Add expense</button>
        </form>

        <div className="summaryColumn">
          <section className="panel summaryPanel">
            <h2>Split summary</h2>

            <div className="summaryGrid">
              <div>
                <span>Total spent</span>
                <strong>{formatMoney(total)}</strong>
              </div>
              <div>
                <span>Each person pays</span>
                <strong>{formatMoney(splitAmount)}</strong>
              </div>
              <div>
                <span>Food subtotal</span>
                <strong>{formatMoney(foodSubtotal)}</strong>
              </div>
            </div>
          </section>

          <ExpenseCount
            expenses={budgetForm.expenses}
            formatMoney={formatMoney}
            onDeleteExpense={handleDeleteExpense}
          />
        </div>
      </section>
    </main>
  )
}

export default App
