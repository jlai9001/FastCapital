-- Drop existing objects
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS financials CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP TYPE IF EXISTS financial_type CASCADE;
DROP TYPE IF EXISTS purchase_status CASCADE;

-- Create ENUM types
CREATE TYPE financial_type AS ENUM ('income', 'expense', 'asset', 'liability');
CREATE TYPE purchase_status AS ENUM ('pending', 'completed', 'expired');


-- ADD COLUMN hashed_password VARCHAR,
-- ADD COLUMN session_token VARCHAR,
-- ADD COLUMN session_expires_at TIMESTAMP;

-- Create tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    session_token VARCHAR(255),
    session_expires_at TIMESTAMP
);

CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id INT REFERENCES users(id),
    image_url VARCHAR(255),
    website_url VARCHAR(255) NOT NULL,
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    postal_code VARCHAR(255) NOT NULL
);

CREATE TABLE financials (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id),
    date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type financial_type NOT NULL
);

CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    business_id INT REFERENCES businesses(id),
    shares_available INT NOT NULL,
    price_per_share DECIMAL(10,2) NOT NULL,
    min_investment INT NOT NULL,
    start_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    featured BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    investment_id INT REFERENCES investments(id),
    user_id INT REFERENCES users(id),
    shares_purchased INT NOT NULL,
    cost_per_share DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    status purchase_status NOT NULL DEFAULT 'pending'
);

INSERT INTO users(id, name, email, hashed_password)
VALUES
    (1, 'John Smith', 'jsmith@email.com', 'password'),
    (2, 'Jane Doe', 'jdoe@email.com', 'password'),
    (3, 'Alice Johnson', 'alicej@email.com', 'password'),
    (4, 'Bob Williams', 'bwilliams@email.com', 'password'),
    (5, 'Carol Taylor', 'ctaylor@email.com', 'password'),
    (6, 'David Brown', 'dbrown@email.com', 'password'),
    (7, 'Emily Davis', 'edavis@email.com', 'password'),
    (8, 'Frank Miller', 'fmiller@email.com', 'password'),
    (9, 'Grace Wilson', 'gwilson@email.com', 'password'),
    (10, 'Henry Moore', 'hmoore@email.com', 'password'),
    (11, 'Isla Thomas', 'ithomas@email.com', 'password'),
    (12, 'Jack Lee', 'jlee@email.com', 'password'),
    (13, 'Karen Hall', 'khall@email.com', 'password'),
    (14, 'Liam Young', 'lyoung@email.com', 'password'),
    (15, 'Mia King', 'mking@email.com', 'password'),
    (16, 'Noah Wright', 'nwright@email.com', 'password'),
    (17, 'Olivia Scott', 'oscott@email.com', 'password'),
    (18, 'Paul Green', 'pgreen@email.com', 'password'),
    (19, 'Quinn Adams', 'qadams@email.com', 'password'),
    (20, 'Ruby Baker', 'rbaker@email.com', 'password');

-- Seed businesses (website_url always a non-null string)
INSERT INTO businesses(id, name, user_id, image_url, website_url, address1, address2, city, state, postal_code) VALUES
  (1,  'Best Burgers',           1, 'http://example.com/image1.jpg', 'http://bestburgers.example.com',      '123 Main St',      'Apt 4B',     'Los Angeles',    'CA', '90001'),
  (2,  'Tech Innovations',       2, 'http://example.com/image2.jpg', 'http://techinnovations.example.com', '456 Market St',    '',           'San Francisco',  'CA', '94105'),
  (3,  'Green Grocer',           3, 'http://example.com/image3.jpg', 'http://greengrocer.example.com',     '789 Broadway',     '',           'New York',       'NY', '10001'),
  (4,  'Fitness Hub',            4, 'http://example.com/image4.jpg', 'http://fitnesshub.example.com',      '101 State St',     '',           'Chicago',        'IL', '60601'),
  (5,  'Fashion Forward',        5, 'http://example.com/image5.jpg', 'http://fashionforward.example.com',  '202 Ocean Dr',     '',           'Miami',          'FL', '33101'),
  (6,  'Gourmet Coffee Co.',     6, 'http://example.com/image6.jpg', 'http://gourmetcoffee.example.com',   '303 Pike St',      '',           'Seattle',        'WA', '98101'),
  (7,  'Home Decor Haven',       7, 'http://example.com/image7.jpg', 'http://homedecorhaven.example.com',  '404 Congress Ave', '',           'Austin',         'TX', '73301'),
  (8,  'Pet Paradise',           8, 'http://example.com/image8.jpg', 'http://petparadise.example.com',     '505 Colfax Ave',   '',           'Denver',         'CO', '80201'),
  (9,  'Travel Adventures Inc.', 9, 'http://example.com/image9.jpg', 'http://traveladventures.example.com','606 Boylston St',  '',           'Boston',         'MA', '02101'),
  (10, 'Digital Marketing Pros', 10,'http://example.com/image10.jpg','http://digitalmarketing.example.com', '707 Pike St',      '',           'Seattle',        'WA', '98101');

-- Seed financials (4 rows per business: income, expense, asset, liability)
INSERT INTO financials(id, business_id, date,       amount,    type) VALUES
  -- Business 1
  (1,  1, '2023-01-01', 50000.00, 'income'),
  (2,  1, '2023-02-01', 20000.00, 'expense'),
  (3,  1, '2023-03-01', 65000.00, 'asset'),
  (4,  1, '2023-04-01', 30000.00, 'liability'),

  -- Business 2
  (5,  2, '2023-01-15',100000.00,'income'),
  (6,  2, '2023-02-15', 30000.00,'expense'),
  (7,  2, '2023-03-15',130000.00,'asset'),
  (8,  2, '2023-04-15', 80000.00,'liability'),

  -- Business 3
  (9,  3, '2023-01-20', 75000.00,'income'),
  (10, 3, '2023-02-20', 25000.00,'expense'),
  (11, 3, '2023-03-20', 90000.00,'asset'),
  (12, 3, '2023-04-20', 60000.00,'liability'),

  -- Business 4
  (13, 4, '2023-01-25', 60000.00,'income'),
  (14, 4, '2023-02-25', 15000.00,'expense'),
  (15, 4, '2023-03-25', 78000.00,'asset'),
  (16, 4, '2023-04-25', 50000.00,'liability'),

  -- Business 5
  (17, 5, '2023-01-30', 80000.00,'income'),
  (18, 5, '2023-02-28', 20000.00,'expense'),
  (19, 5, '2023-03-30',105000.00,'asset'),
  (20, 5, '2023-04-30', 70000.00,'liability'),

  -- Business 6
  (21, 6, '2023-01-05', 90000.00,'income'),
  (22, 6, '2023-02-05', 30000.00,'expense'),
  (23, 6, '2023-03-05',115000.00,'asset'),
  (24, 6, '2023-04-05', 80000.00,'liability'),

  -- Business 7
  (25, 7, '2023-01-10', 70000.00,'income'),
  (26, 7, '2023-02-10', 25000.00,'expense'),
  (27, 7, '2023-03-10', 88000.00,'asset'),
  (28, 7, '2023-04-10', 60000.00,'liability'),

  -- Business 8
  (29, 8, '2023-01-15', 65000.00,'income'),
  (30, 8, '2023-02-15', 20000.00,'expense'),
  (31, 8, '2023-03-15', 82000.00,'asset'),
  (32, 8, '2023-04-15', 55000.00,'liability'),

  -- Business 9
  (33, 9, '2023-01-20', 85000.00,'income'),
  (34, 9, '2023-02-20', 30000.00,'expense'),
  (35, 9, '2023-03-20',110000.00,'asset'),
  (36, 9, '2023-04-20', 70000.00,'liability'),

  -- Business 10
  (37,10,'2023-01-25', 95000.00,'income'),
  (38,10,'2023-02-25', 15000.00,'expense'),
  (39,10,'2023-03-25',125000.00,'asset'),
  (40,10,'2023-04-25', 90000.00,'liability');

-- Seed investments (10 total)
INSERT INTO investments(id, business_id, shares_available, price_per_share, min_investment, start_date,    expiration_date, featured) VALUES
  (1,  1,  500, 10.00, 100, '2023-03-01', '2023-06-01', true),
  (2,  2, 1000, 20.00, 100, '2023-03-15', '2023-09-15', false),
  (3,  3,  750, 15.00,  50, '2023-04-01', '2023-08-01', true),
  (4,  4,  600, 12.00, 100, '2023-04-15', '2023-10-15', false),
  (5,  5,  800, 18.00, 100, '2023-05-01', '2023-11-01', true),
  (6,  6,  900, 22.00, 100, '2023-05-15', '2023-12-15', false),
  (7,  7,  700, 14.00, 100, '2023-06-01', '2024-01-01', true),
  (8,  8,  500, 16.00,  50, '2023-06-15', '2024-02-15', false),
  (9,  9,  850, 19.00,  50, '2023-07-01', '2024-03-01', true),
  (10,10,  950, 25.00,  50, '2023-07-15', '2024-04-15', false);

-- Seed purchases (15 total)
INSERT INTO purchases(id, investment_id, user_id, shares_purchased, cost_per_share, purchase_date, status) VALUES
  -- User 1: 3 completed, 2 expired, 2 pending
  (1,  1, 1, 100, 10.00, '2023-03-02', 'completed'),
  (2,  2, 1, 150, 20.00, '2023-04-01', 'completed'),
  (3,  3, 1,  80, 15.00, '2023-05-05', 'completed'),
  (4,  4, 1,  50, 12.00, '2023-06-01', 'expired'),
  (5,  5, 1,  60, 18.00, '2023-07-01', 'expired'),
  (6,  6, 1, 120, 22.00, '2023-08-01', 'pending'),
  (7,  7, 1,  40, 14.00, '2023-09-01', 'pending'),

  -- User 2: 3 completed, 2 expired, 2 pending
  (8,  2, 2, 200, 20.00, '2023-03-16', 'completed'),
  (9,  4, 2,  90, 12.00, '2023-04-16', 'completed'),
  (10, 6, 2, 110, 22.00, '2023-05-16', 'completed'),
  (11, 1, 2,  30, 10.00, '2023-06-02', 'expired'),
  (12, 3, 2,  70, 15.00, '2023-07-02', 'expired'),
  (13, 5, 2,  95, 18.00, '2023-08-02', 'pending'),
  (14, 8, 2,  55, 16.00, '2023-09-02', 'pending'),

  -- User 3: none

  -- User 4: one completed
  (15,  9, 4,  85, 19.00, '2023-07-02', 'completed');

-- run the following line in the psql shell to load this file
-- \i data/fastcapitaldata.sql
