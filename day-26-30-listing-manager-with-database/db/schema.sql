DROP TABLE IF EXISTS listings;

CREATE TABLE listings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  city TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  property_type TEXT NOT NULL,
  bedrooms INTEGER NOT NULL CHECK (bedrooms >= 0),
  status TEXT NOT NULL DEFAULT 'available'
    CHECK (status IN ('available', 'pending', 'rented')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
