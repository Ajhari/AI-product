
import React, { useEffect, useState } from 'react';
const API_URL = 'http://localhost:3001/api/listings';

const emptyForm = {
  title: '',
  city: '',
  price: '',
  property_type: 'apartment',
  bedrooms: '1',
  status: 'available',
};

function App() {
  const [listings, setListings] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function fetchListings() {
    setIsLoading(true);
    const response = await fetch(API_URL);
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
    fetchListings().catch(() => {
      setMessage('Could not load listings.');
      setMessageType('error');
      setIsLoading(false);
    });
  }, []);

  function showMessage(text, type = 'info') {
    setMessage(text);
    setMessageType(type);
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
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
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

  return (
    <main className="app-shell">
      <section className="page-header">
        <div>
          <h1>Listing Manager</h1>
          <p>Manage rental listings saved in PostgreSQL.</p>
        </div>
        <div className="summary">
          <span>{listings.length} total</span>
          <span>{availableCount} available</span>
          <span>{pendingCount} pending</span>
          <span>{rentedCount} rented</span>
        </div>
      </section>

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
    </main>
  );
}

export default App;
