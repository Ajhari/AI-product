
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
const API_BASE_URL = 'http://localhost:3001/api';
const LISTINGS_API_URL = `${API_BASE_URL}/listings`;
const AUTH_API_URL = `${API_BASE_URL}/auth`;
const AUTH_TOKEN_KEY = 'listingManagerAuthToken';

const emptyForm = {
  title: '',
  city: '',
  price: '',
  property_type: 'apartment',
  bedrooms: '1',
  status: 'available',
};

const emptySignupForm = {
  name: '',
  email: '',
  password: '',
};

const emptyLoginForm = {
  email: '',
  password: '',
};

function ProtectedRoute({ currentUser, children }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [authMode, setAuthMode] = useState('login');
  const [signupForm, setSignupForm] = useState(emptySignupForm);
  const [loginForm, setLoginForm] = useState(emptyLoginForm);
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authMessageType, setAuthMessageType] = useState('info');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthSaving, setIsAuthSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);

    if (!savedToken) {
      setIsCheckingAuth(false);
      return;
    }

    async function loadCurrentUser() {
      try {
        const response = await fetch(`${AUTH_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          localStorage.removeItem(AUTH_TOKEN_KEY);
          setIsCheckingAuth(false);
          return;
        }

        setAuthToken(savedToken);
        setCurrentUser(data);
      } catch (error) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    loadCurrentUser();
  }, []);

  async function fetchListings() {
    setIsLoading(true);
    const response = await fetch(LISTINGS_API_URL, {
  headers: {
    Authorization: `Bearer ${authToken}`,
  },
});
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Could not load listings.');
    }

    if (!Array.isArray(data)) {
      throw new Error('Listings response was not an array.');
    }

    setListings(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    fetchListings().catch(() => {
      setMessage('Could not load listings.');
      setMessageType('error');
      setIsLoading(false);
    });
  }, [currentUser]);

  function showMessage(text, type = 'info') {
    setMessage(text);
    setMessageType(type);
  }

  function showAuthMessage(text, type = 'info') {
    setAuthMessage(text);
    setAuthMessageType(type);
  }

  function validateForm() {
    if (!formData.title.trim() || !formData.city.trim()) {
      return 'Title and city are required.';
    }

    if (Number(formData.price) < 0 || formData.price === '') {
      return 'Price must be zero or more.';
    }

    if (!Number.isInteger(Number(formData.bedrooms)) || Number(formData.bedrooms) < 0) {
      return 'Bedrooms must be a whole number.';
    }

    return '';
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  }

  function handleSignupChange(event) {
    const { name, value } = event.target;
    setSignupForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  function handleLoginChange(event) {
    const { name, value } = event.target;
    setLoginForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();
    showAuthMessage('');

    if (!signupForm.name.trim() || !signupForm.email.trim() || !signupForm.password) {
      showAuthMessage('Name, email, and password are required.', 'error');
      return;
    }

    if (signupForm.password.length < 6) {
      showAuthMessage('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsAuthSaving(true);

    try {
      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupForm),
      });

      const data = await response.json();

      if (!response.ok) {
        showAuthMessage(data.error || 'Could not sign up.', 'error');
        return;
      }

      setSignupForm(emptySignupForm);
      setLoginForm({
        email: data.email,
        password: '',
      });
      setAuthMode('login');
      showAuthMessage('Signup worked. Now log in with the same email.', 'success');
    } catch (error) {
      showAuthMessage('Could not connect to the backend.', 'error');
    } finally {
      setIsAuthSaving(false);
    }
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();
    showAuthMessage('');

    if (!loginForm.email.trim() || !loginForm.password) {
      showAuthMessage('Email and password are required.', 'error');
      return;
    }

    setIsAuthSaving(true);

    try {
      const response = await fetch(`${AUTH_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (!response.ok) {
        showAuthMessage(data.error || 'Could not log in.', 'error');
        return;
      }

      setAuthToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      navigate('/dashboard');
      
  
      showAuthMessage(`Logged in as ${data.user.name}.`, 'success');
    } catch (error) {
      showAuthMessage('Could not connect to the backend.', 'error');
    } finally {
      setIsAuthSaving(false);
    }
  }

  async function checkCurrentUser() {
    showAuthMessage('');

    if (!authToken) {
      showAuthMessage('Log in first, then check current user.', 'error');
      return;
    }

    try {
      const response = await fetch(`${AUTH_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        showAuthMessage(data.error || 'Could not find current user.', 'error');
        return;
      }

      setCurrentUser(data);
      showAuthMessage(`Current user is ${data.name}.`, 'success');
    } catch (error) {
      showAuthMessage('Could not connect to the backend.', 'error');
    }
  }

  function logout() {
    setAuthToken('');
    setCurrentUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    
    setListings([]);
    navigate('/login');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    showMessage('');

    const formError = validateForm();

    if (formError) {
      showMessage(formError, 'error');
      return;
    }

    setIsSaving(true);

    try {
      const url = editingId ? `${LISTINGS_API_URL}/${editingId}` : LISTINGS_API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || 'Could not save listing.', 'error');
        return;
      }

      if (editingId) {
        setEditingId(null);
        showMessage('Listing updated.', 'success');
      } else {
        showMessage('Listing created.', 'success');
      }

      setFormData(emptyForm);
      await fetchListings();
    } catch (error) {
      showMessage('Could not connect to the backend.', 'error');
    } finally {
      setIsSaving(false);
    }
  }

  function startEdit(listing) {
    setEditingId(listing.id);
    setFormData({
      title: listing.title,
      city: listing.city,
      price: listing.price,
      property_type: listing.property_type,
      bedrooms: String(listing.bedrooms),
      status: listing.status,
    });
    showMessage('Editing listing.', 'info');
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData(emptyForm);
    showMessage('Edit cancelled.', 'info');
  }

  function askDelete(id) {
    setPendingDeleteId(id);
    showMessage('Please confirm delete.', 'info');
  }

  function cancelDelete() {
    setPendingDeleteId(null);
    showMessage('Delete cancelled.', 'info');
  }

  async function confirmDelete(id) {
    showMessage('');

    try {
      const response = await fetch(`${LISTINGS_API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

      const data = await response.json();

      if (!response.ok) {
        showMessage(data.error || 'Could not delete listing.', 'error');
        return;
      }

      setListings((currentListings) => currentListings.filter((listing) => listing.id !== id));
      await fetchListings();

      if (editingId === id) {
        cancelEdit();
      } else {
        showMessage('Listing deleted.', 'success');
      }

      setPendingDeleteId(null);
    } catch (error) {
      showMessage('Could not connect to the backend.', 'error');
    }
  }

  const availableCount = listings.filter((listing) => listing.status === 'available').length;
  const pendingCount = listings.filter((listing) => listing.status === 'pending').length;
  const rentedCount = listings.filter((listing) => listing.status === 'rented').length;
  const visibleListings =
    statusFilter === 'all'
      ? listings
      : listings.filter((listing) => listing.status === statusFilter);

  if (isCheckingAuth) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <h1>Listing Manager</h1>
          <p>Checking login...</p>
        </section>
      </main>
    );
  }

  const authScreen = (
      <main className="auth-screen">
        <section className="auth-card">
          <div className="panel-heading">
            <div>
              <h1>Listing Manager</h1>
              <p>Login or create an account to continue.</p>
            </div>
          </div>

          <div className="auth-tabs">
            <button
              type="button"
              className={authMode === 'login' ? 'active-tab' : 'secondary-button'}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'signup' ? 'active-tab' : 'secondary-button'}
              onClick={() => setAuthMode('signup')}
            >
              Signup
            </button>
          </div>

          {authMode === 'signup' && (
            <form className="auth-form auth-form-vertical" onSubmit={handleSignupSubmit}>
              <label>
                Name
                <input name="name" value={signupForm.name} onChange={handleSignupChange} required />
              </label>

              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={signupForm.email}
                  onChange={handleSignupChange}
                  required
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  minLength="6"
                  value={signupForm.password}
                  onChange={handleSignupChange}
                  required
                />
              </label>

              <button disabled={isAuthSaving}>{isAuthSaving ? 'Creating...' : 'Create Account'}</button>
            </form>
          )}

          {authMode === 'login' && (
            <form className="auth-form auth-form-vertical" onSubmit={handleLoginSubmit}>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  required
                />
              </label>

              <label>
                Password
                <input
                  name="password"
                  type="password"
                  value={loginForm.password}
                  onChange={handleLoginChange}
                  required
                />
              </label>

              <button disabled={isAuthSaving}>{isAuthSaving ? 'Logging in...' : 'Login'}</button>
            </form>
          )}

          {authMessage && <p className={`message ${authMessageType}`}>{authMessage}</p>}
        </section>
      </main>
  );

  const privateScreen = currentUser ? (
    <main className="app-shell">
      <section className="page-header">
        <div> 
          <h1>Listing Manager</h1>
          <p>Private screens are available only after login.</p>
        </div>
        <div className="private-nav">
          <Link to="/dashboard" className="secondary-button">
            Dashboard
          </Link>
          <Link to="/listings" className="secondary-button">
            Listings
          </Link>
        </div>
      </section>

      <section className="auth-panel">
        <div className="panel-heading">
          <div>
            <h2>Account</h2>
            <p>{`Signed in as ${currentUser.email}`}</p>
          </div>
          <button type="button" className="secondary-button" onClick={logout}>
            Logout
          </button>
        </div>

        <div className="current-user-box">
          <p>
            <strong>{currentUser.name}</strong>
          </p>
          <p>{currentUser.email}</p>
          <button type="button" className="secondary-button" onClick={checkCurrentUser}>
            Check Current User
          </button>
        </div>

        {authMessage && <p className={`message ${authMessageType}`}>{authMessage}</p>}
      </section>

      <Routes>
        <Route
          path="/dashboard"
          element={(
            <section className="records-panel private-dashboard">
          <div className="panel-heading">
            <div>
              <h2>Private Dashboard</h2>
              <p>Only logged-in users can see this screen.</p>
            </div>
          </div>

          <div className="summary dashboard-summary">
            <span>{listings.length} total</span>
            <span>{availableCount} available</span>
            <span>{pendingCount} pending</span>
            <span>{rentedCount} rented</span>
          </div>

          <p className="empty-state">
            This page is protected by React state. If there is no current user, the app shows the
            login/signup screen instead.
          </p>
            </section>
          )}
        />

        <Route
          path="/listings"
          element={(
            <>
          <section className="panel">
            <div className="panel-heading">
              <h2>{editingId ? 'Edit Listing' : 'New Listing'}</h2>
              {editingId && <span>Editing #{editingId}</span>}
            </div>

            <form onSubmit={handleSubmit} className="listing-form">
              <label>
                Title
                <input name="title" value={formData.title} onChange={handleChange} required />
              </label>

              <label>
                City
                <input name="city" value={formData.city} onChange={handleChange} required />
              </label>

              <label>
                Price
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Property Type
                <select name="property_type" value={formData.property_type} onChange={handleChange}>
                  <option value="apartment">Apartment</option>
                  <option value="studio">Studio</option>
                  <option value="villa">Villa</option>
                  <option value="shared">Shared</option>
                </select>
              </label>

              <label>
                Bedrooms
                <input
                  name="bedrooms"
                  type="number"
                  min="0"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Status
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="rented">Rented</option>
                </select>
              </label>

              <button disabled={isSaving}>{isSaving ? 'Saving...' : editingId ? 'Update Listing' : 'Create Listing'}</button>
              {editingId && (
                <button type="button" className="secondary-button" onClick={cancelEdit}>
                  Cancel Edit
                </button>
              )}
            </form>

            {message && <p className={`message ${messageType}`}>{message}</p>}
          </section>

          <section className="records-panel">
            <div className="panel-heading">
              <div>
                <h2>Database Records</h2>
                <p>{visibleListings.length} records shown</p>
              </div>
              <div className="toolbar">
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  <option value="available">Available</option>
                  <option value="pending">Pending</option>
                  <option value="rented">Rented</option>
                </select>
                <button type="button" className="secondary-button" onClick={fetchListings}>
                  Refresh
                </button>
              </div>
            </div>

            {isLoading && <p className="empty-state">Loading listings...</p>}

            {!isLoading && listings.length === 0 && (
              <p className="empty-state">No listings yet. Create the first listing from the form.</p>
            )}

            {!isLoading && listings.length > 0 && visibleListings.length === 0 && (
              <p className="empty-state">No records match this status filter.</p>
            )}

            {!isLoading && visibleListings.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>City</th>
                      <th>Price</th>
                      <th>Type</th>
                      <th>Beds</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleListings.map((listing) => (
                      <tr key={listing.id}>
                        <td>{listing.title}</td>
                        <td>{listing.city}</td>
                        <td>Rs. {listing.price}</td>
                        <td>{listing.property_type}</td>
                        <td>{listing.bedrooms}</td>
                        <td>
                          <span className={`status-badge ${listing.status}`}>{listing.status}</span>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              type="button"
                              className="secondary-button"
                              onClick={() => startEdit(listing)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="danger-button"
                              onClick={() => askDelete(listing.id)}
                            >
                              Delete
                            </button>
                          </div>
                          {pendingDeleteId === listing.id && (
                            <div className="delete-confirm">
                              <p>Delete this listing?</p>
                              <div>
                                <button
                                  type="button"
                                  className="danger-button"
                                  onClick={() => confirmDelete(listing.id)}
                                >
                                  Yes, Delete
                                </button>
                                <button type="button" className="secondary-button" onClick={cancelDelete}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
            </>
          )}
        />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </main>
  ) : null;

  return (
    <Routes>
      <Route
        path="/login"
        element={currentUser ? <Navigate to="/dashboard" replace /> : authScreen}
      />
      <Route
        path="/*"
        element={
          <ProtectedRoute currentUser={currentUser}>
            {privateScreen}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
