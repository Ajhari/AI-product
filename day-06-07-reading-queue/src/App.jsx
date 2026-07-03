import { useState } from 'react'
import './App.css'

const starterBooks = [
  {
    id: 1,
    title: 'Atomic Habits',
    author: 'James Clear',
    status: 'Reading',
    notes: 'Read one chapter after dinner.',
  },
  {
    id: 2,
    title: 'Deep Work',
    author: 'Cal Newport',
    status: 'Queued',
    notes: 'Start this after finishing Atomic Habits.',
  },
  {
    id: 3,
    title: 'Atomic Habits',
    author: 'James Clear',
    status: 'Reading',
    notes: 'Read one chapter after dinner.',
  },
  {
    id: 4,
    title: 'Deep Work',
    author: 'Cal Newport',
    status: 'Queued',
    notes: 'Start this after finishing Atomic Habits.',
  },
    
  
]

const statusOptions = ['Queued', 'Reading', 'Finished']

function App() {
  const [books, setBooks] = useState(starterBooks)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [filter, setFilter] = useState('All')
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editAuthor, setEditAuthor] = useState('')

  const visibleBooks =
    filter === 'All' ? books : books.filter((book) => book.status === filter)

  const readingCount = books.filter((book) => book.status === 'Reading').length
  const finishedCount = books.filter((book) => book.status === 'Finished').length

  function handleAddBook(event) {
    event.preventDefault()

    if (title.trim() === '') {
      return
    }

    const newBook = {
      id: Date.now(),
      title: title.trim(),
      author: author.trim() || 'Unknown author',
      status: 'Queued',
      notes: '',
    }

    setBooks([newBook, ...books])
    setTitle('')
    setAuthor('')
  }

  function handleDeleteBook(id) {
    setBooks(books.filter((book) => book.id !== id))
  }

  function handleStatusChange(id, nextStatus) {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, status: nextStatus } : book,
      ),
    )
  }

  function handleNoteChange(id, nextNotes) {
    setBooks(
      books.map((book) =>
        book.id === id ? { ...book, notes: nextNotes } : book,
      ),
    )
  }

  function startEditing(book) {
    setEditingId(book.id)
    setEditTitle(book.title)
    setEditAuthor(book.author)
  }

  function cancelEditing() {
    setEditingId(null)
    setEditTitle('')
    setEditAuthor('')
  }

  function saveBookEdit(id) {
    if (editTitle.trim() === '') {
      return
    }

    setBooks(
      books.map((book) =>
        book.id === id
          ? {
              ...book,
              title: editTitle.trim(),
              author: editAuthor.trim() || 'Unknown author',
            }
          : book,
      ),
    )

    cancelEditing()
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Week 2 Reading Queue</p>
          <h1>Track what you want to read next.</h1>
        </div>

        <div className="stats">
          <div>
            <span>{books.length}</span>
            <p>Total</p>
          </div>
          <div>
            <span>{readingCount}</span>
            <p>Reading</p>
          </div>
          <div>
            <span>{finishedCount}</span>
            <p>Finished</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <form className="book-form" onSubmit={handleAddBook}>
          <label>
            Book title
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Example: The Alchemist"
            />
          </label>

          <label>
            Author
            <input
              type="text"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Example: Paulo Coelho"
            />
          </label>

          <button type="submit">Add item</button>
        </form>
      </section>

      <section className="toolbar" aria-label="Filter reading queue">
        {['All', ...statusOptions].map((status) => (
          <button
            key={status}
            type="button"
            className={filter === status ? 'active' : ''}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </section>

      <section className="book-grid">
        {visibleBooks.length === 0 ? (
          <div className="empty-state">
            <h2>No books here yet</h2>
            <p>Add a book or choose another filter.</p>
          </div>
        ) : (
          visibleBooks.map((book) => {
            const isEditing = editingId === book.id

            return (
              <article className="book-card" key={book.id}>
                <div className="card-top">
                  {isEditing ? (
                    <div className="edit-fields">
                      <label>
                        Edit title
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                        />
                      </label>

                      <label>
                        Edit author
                        <input
                          type="text"
                          value={editAuthor}
                          onChange={(event) =>
                            setEditAuthor(event.target.value)
                          }
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <p className="status-label">{book.status}</p>
                      <h2>{book.title}</h2>
                      <p className="author">by {book.author}</p>
                    </div>
                  )}

                  <div className="card-actions">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          className="save-button"
                          onClick={() => saveBookEdit(book.id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => startEditing(book)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="remove-button"
                          onClick={() => handleDeleteBook(book.id)}
                          aria-label={`Remove ${book.title}`}
                        >
                          Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <label className="status-control">
                  Progress
                  <select
                    value={book.status}
                    onChange={(event) =>
                      handleStatusChange(book.id, event.target.value)
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="notes-control">
                  Notes
                  <textarea
                    value={book.notes}
                    onChange={(event) =>
                      handleNoteChange(book.id, event.target.value)
                    }
                    placeholder="Write a short reading note..."
                  />
                </label>
              </article>
            )
          })
        )}
      </section>
    </main>
  )
}

export default App
