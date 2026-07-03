function ExpenseCount({ expenses, formatMoney, onDeleteExpense }) {
  return (
    <section className="panel expenseCountBox">
      <span>Number of expenses</span>
      <strong>{expenses.length}</strong>

      <ul className="expenseNameList">
        {expenses.map((expense) => (
          <li key={expense.id}>
            <div>
              <span>{expense.name}</span>
              {expense.foodType && (
                <span className="foodType">{expense.foodType}</span>
              )}
              <strong>{formatMoney(expense.amount)}</strong>
            </div>
            <button
              type="button"
              className="deleteButton"
              onClick={() => onDeleteExpense(expense.id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default ExpenseCount
