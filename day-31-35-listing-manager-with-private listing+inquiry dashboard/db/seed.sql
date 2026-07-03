TRUNCATE TABLE listings, users RESTART IDENTITY CASCADE;

INSERT INTO users (name, email, password_hash)
VALUES
  (
    'Test User One',
    'user1@example.com',
    '11111111111111111111111111111111:46eea989e4b27a77591147474294b7292a6d4d70c3e7c188ec60e3dfb690d9554832d5a22674a544ddcd3f6caceea6b3e51b916278489be756513ef9dc82cdb6'
  ),
  (
    'Test User Two',
    'user2@example.com',
    '22222222222222222222222222222222:b42ef4e9e276cbc3cffb5e60c1b86f2c06dd61225e4126fbc00415e1e4c89875b64ed664009704521a7d0c477f7039cc1595d3651707d10f11145134ef4c25b2'
  );

INSERT INTO listings
  (user_id, title, city, price, property_type, bedrooms, status)
VALUES
  ((SELECT id FROM users WHERE email = 'user1@example.com'),'Sunny 2BHK near metro','Chennai',22000,'apartment', 2,'available'),
  ((SELECT id FROM users WHERE email = 'user1@example.com'),'Compact studio for students''Bengaluru',14000,'studio',1,'pending'),
  ((SELECT id FROM users WHERE email = 'user2@example.com'),'Family villa with parking','Coimbatore',32000,'villa',3,'available');