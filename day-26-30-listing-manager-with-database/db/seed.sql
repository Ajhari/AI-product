TRUNCATE TABLE listings RESTART IDENTITY;

INSERT INTO listings
  (title, city, price, property_type, bedrooms, status)
VALUES
  ('Sunny 2BHK near metro', 'Chennai', 22000.00, 'apartment', 2, 'available'),
  ('Compact studio for students', 'Bengaluru', 14000.00, 'studio', 1, 'pending'),
  ('Family villa with parking', 'Coimbatore', 32000.00, 'villa', 3, 'available'),
  ('Shared flat close to IT park', 'Hyderabad', 9500.00, 'shared', 1, 'rented'),
  ('Private villa near beach', 'Pondy', 5000.00, 'villa', 2, 'available');