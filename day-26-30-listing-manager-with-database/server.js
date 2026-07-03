const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;
const databaseUrl = process.env.DATABASE_URL;

app.use(cors());
app.use(express.json());

if (!databaseUrl || databaseUrl.includes('your_password')) {
  console.error(
    'DATABASE_URL is missing or still has the placeholder password. Update .env with your real PostgreSQL password, then restart the server.'
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const allowedStatuses = ['available', 'pending', 'rented'];

function validateListingInput({ title, city, price, property_type, bedrooms, status }) {
  if (!title || !city || !price || !property_type || bedrooms === undefined || !status) {
    return { error: 'All listing fields are required' };
  }

  const numericPrice = Number(price);
  const numericBedrooms = Number(bedrooms);

  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    return { error: 'Price must be a positive number' };
  }

  if (!Number.isInteger(numericBedrooms) || numericBedrooms < 0) {
    return { error: 'Bedrooms must be a whole number' };
  }

  if (!allowedStatuses.includes(status)) {
    return { error: 'Status must be available, pending, or rented' };
  }

  return {
    value: {
      title,
      city,
      price: numericPrice,
      property_type,
      bedrooms: numericBedrooms,
      status,
    },
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/listings', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, city, price, property_type, bedrooms, status, created_at FROM listings ORDER BY id'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Could not fetch listings' });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    const validation = validateListingInput(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { title, city, price, property_type, bedrooms, status } = validation.value;

    const result = await pool.query(
      `INSERT INTO listings (title, city, price, property_type, bedrooms, status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, city, price, property_type, bedrooms, status, created_at`,
      [title, city, price, property_type, bedrooms, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Could not create listing' });
  }
});

app.put('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const validation = validateListingInput(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { title, city, price, property_type, bedrooms, status } = validation.value;

    const result = await pool.query(
      `UPDATE listings
       SET title = $1,
           city = $2,
           price = $3,
           property_type = $4,
           bedrooms = $5,
           status = $6
       WHERE id = $7
       RETURNING id, title, city, price, property_type, bedrooms, status, created_at`,
      [title, city, price, property_type, bedrooms, status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating listing:', error);
    res.status(500).json({ error: 'Could not update listing' });
  }
});

app.delete('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM listings WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json({ message: 'Listing deleted', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({ error: 'Could not delete listing' });
  }
});

app.get('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'SELECT id, title, city, price, property_type, bedrooms, status, created_at FROM listings WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({ error: 'Could not fetch listing' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
