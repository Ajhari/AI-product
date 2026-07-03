const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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

const sessions = new Map();
const allowedStatuses = ['available', 'pending', 'rented'];

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');

  return `${salt}:${hash}`;
}

function verifyPassword(password, savedPasswordHash) {
  const [salt, savedHash] = savedPasswordHash.split(':');
  const attemptedHash = hashPassword(password, salt).split(':')[1];

  return crypto.timingSafeEqual(Buffer.from(savedHash), Buffer.from(attemptedHash));
}

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.slice('Bearer '.length);
}

function requireUser(req, res, next) {
  const token = getTokenFromRequest(req);
  const user = sessions.get(token);

  if (!user) {
    return res.status(401).json({ error: 'Please log in first' });
  }

  req.user = user;
  next();
}

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

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const passwordHash = hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name.trim(), normalizedEmail, passwordHash]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }

    console.error('Error signing up:', error);
    res.status(500).json({ error: 'Could not sign up' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const result = await pool.query(
      'SELECT id, name, email, password_hash FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];

    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const safeUser = { id: user.id, name: user.name, email: user.email };

    sessions.set(token, safeUser);

    res.json({ token, user: safeUser });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Could not log in' });
  }
});

app.get('/api/auth/me', requireUser, (req, res) => {
  res.json(req.user);
});



app.get('/api/listings', requireUser, async (req, res) => {
  try {
    const { listingId } = req.query;

    if (listingId !== undefined) {
      const numericListingId = Number(listingId);

      if (!Number.isInteger(numericListingId) || numericListingId < 1) {
        return res.status(400).json({ error: 'Valid listingId is required' });
      }

      const listingResult = await pool.query(
        `SELECT id, user_id, title, city, price,
                property_type, bedrooms, status, created_at
         FROM listings
         WHERE id = $1 AND user_id = $2`,
        [numericListingId, req.user.id]
      );

      if (listingResult.rows.length === 0) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      return res.json(listingResult.rows[0]);
    }

    const result = await pool.query(
      `SELECT id, user_id, title, city, price,
              property_type, bedrooms, status, created_at
       FROM listings
       WHERE user_id = $1
       ORDER BY id`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'Could not fetch listings' });
  }
});

app.post('/api/listings', requireUser, async (req, res) => {
  try {
    const validation = validateListingInput(req.body);

    if (validation.error) {
      return res.status(400).json({ error: validation.error });
    }

    const { title, city, price, property_type, bedrooms, status } = validation.value;

    const result = await pool.query(
      `INSERT INTO listings
         (user_id, title, city, price, property_type, bedrooms, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_id, title, city, price, property_type,
                 bedrooms, status, created_at`,
      [req.user.id, title, city, price, property_type, bedrooms, status]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: 'Could not create listing' });
  }
});

app.put('/api/listings/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerResult = await pool.query(
      'SELECT user_id FROM listings WHERE id = $1',
     [id]
    );

    if (ownerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (ownerResult.rows[0].user_id !== req.user.id) {
     return res.status(403).json({
       error: 'You cannot update another user listing',
     });
   }
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

app.delete('/api/listings/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;
    const ownerResult = await pool.query(
      'SELECT user_id FROM listings WHERE id = $1',
      [id]
   );

   if (ownerResult.rows.length === 0) {
    return res.status(404).json({
      error: 'Listing not found',
    });
  }

  if (ownerResult.rows[0].user_id !== req.user.id) {
    return res.status(403).json({
      error: 'You cannot delete another user listing',
    });
  }

    const result = await pool.query(
      `DELETE FROM listings
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Listing not found',
      });
    }

    res.json({
      message: 'Listing deleted',
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error('Error deleting listing:', error);
    res.status(500).json({
      error: 'Could not delete listing',
    });
  }
});

app.get('/api/listings/:id', requireUser, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, user_id, title, city, price,
              property_type, bedrooms, status, created_at
       FROM listings
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Listing not found',
      });
    }

    const listing = result.rows[0];

    if (listing.user_id !== req.user.id) {
      return res.status(403).json({
        error: 'You cannot view another user listing',
      });
    }

    res.json(listing);
  } catch (error) {
    console.error('Error fetching listing:', error);
    res.status(500).json({
      error: 'Could not fetch listing',
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
