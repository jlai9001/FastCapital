DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS investments;
DROP TABLE IF EXISTS financials;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS users;

DROP TYPE IF EXISTS financial_type;
DROP TYPE IF EXISTS purchase_status;

CREATE TYPE financial_type AS ENUM ('income', 'expense', 'asset', 'liability');
CREATE TYPE purchase_status AS ENUM ('pending', 'completed', 'expired');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE businesses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id int REFERENCES users(id),
    image_url VARCHAR(255),
    website_url VARCHAR(255),
    address1 VARCHAR(255) NOT NULL,
    address2 VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    state VARCHAR(255) NOT NULL,
    postal_code VARCHAR(255) NOT NULL
);

CREATE TABLE financials (
    id SERIAL PRIMARY KEY,
    business_id int REFERENCES businesses(id),
    date DATE NOT NULL,
    amount decimal(10, 2) NOT NULL,
    type financial_type NOT NULL
);

CREATE TABLE investments (
    id SERIAL PRIMARY KEY,
    business_id int REFERENCES businesses(id),
    shares_available int NOT NULL,
    price_per_share decimal(10, 2) NOT NULL,
    min_investment int NOT NULL,
    start_date DATE NOT NULL,
    expiration_date DATE NOT NULL,
    featured boolean NOT NULL DEFAULT false
);

CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    investment_id int REFERENCES investments(id),
    user_id int REFERENCES users(id),
    shares_purchased int NOT NULL,
    cost_per_share decimal(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    status purchase_status NOT NULL DEFAULT 'pending'
);

INSERT INTO users(id, name, email, password)
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

INSERT INTO businesses(id, name, user_id, image_url, website_url, address1, address2, city, state, postal_code)
VALUES
    (1, 'Best Burgers', 1, 'http://example.com/image1.jpg', 'http://www.hackreactor.com', '123 Main St', 'Apt 4B', 'Los Angeles', 'CA', '90001'),
    (2, 'Tech Innovations', 2, 'http://example.com/image2.jpg', 'http://www.hackreactor.com', '456 Market St', NULL, 'San Francisco', 'CA', '94105'),
    (3, 'Green Grocer', 3, 'http://example.com/image3.jpg', 'http://www.hackreactor.com', '789 Broadway', NULL, 'New York', 'NY', '10001'),
    (4, 'Fitness Hub', 4, 'http://example.com/image4.jpg', 'http://www.hackreactor.com', '101 State St', NULL, 'Chicago', 'IL', '60601'),
    (5, 'Fashion Forward', 5, 'http://example.com/image5.jpg', 'http://www.hackreactor.com', '202 Ocean Dr', NULL, 'Miami', 'FL', '33101'),
    (6, 'Gourmet Coffee Co.', 6, 'http://example.com/image6.jpg', 'http://www.hackreactor.com', '303 Pike St', NULL, 'Seattle', 'WA', '98101'),
    (7, 'Home Decor Haven', 7, 'http://example.com/image7.jpg', 'http://www.hackreactor.com', '404 Congress Ave', NULL, 'Austin', 'TX', '73301'),
    (8, 'Pet Paradise', 8, 'http://example.com/image8.jpg', 'http://www.hackreactor.com', '505 Colfax Ave', NULL, 'Denver', 'CO', '80201'),
    (9, 'Travel Adventures Inc.', 9, 'http://example.com/image9.jpg', 'http://www.hackreactor.com', '606 Boylston St', NULL, 'Boston', 'MA', '02101'),
    (10, 'Digital Marketing Pros', 10, 'http://example.com/image10.jpg', 'http://www.hackreactor.com', '707 Pike St', NULL, 'Seattle', 'WA', '98101');

INSERT INTO financials(id, business_id, date, amount, type)
VALUES
    (1, 1, '2023-01-01', 50000.00, 'income'),
    (2, 1, '2023-02-01', 20000.00, 'expense'),
    (3, 2, '2023-01-15', 100000.00, 'income'),
    (4, 2, '2023-02-15', 30000.00, 'expense'),
    (5, 3, '2023-01-20', 75000.00, 'income'),
    (6, 3, '2023-02-20', 25000.00, 'expense'),
    (7, 4, '2023-01-25', 60000.00, 'income'),
    (8, 4, '2023-02-25', 15000.00, 'expense'),
    (9, 5, '2023-01-30', 80000.00, 'income'),
    (10, 5, '2023-02-28', 20000.00, 'expense'),
    (11, 6, '2023-01-05', 90000.00, 'income'),
    (12, 6, '2023-02-05', 30000.00, 'expense'),
    (13, 7, '2023-01-10', 70000.00, 'income'),
    (14, 7, '2023-02-10', 25000.00, 'expense'),
    (15, 8, '2023-01-15', 65000.00, 'income'),
    (16, 8, '2023-02-15', 20000.00, 'expense'),
    (17, 9, '2023-01-20', 85000.00, 'income'),
    (18, 9, '2023-02-20', 30000.00, 'expense'),
    (19, 10, '2023-01-25', 95000.00, 'income'),
    (20, 10, '2023-02-25', 15000.00, 'expense');

INSERT INTO investments(id, business_id, shares_available, price_per_share, min_investment, start_date, expiration_date, featured)
VALUES
    (1, 1, 500, 10.00, 100, '2023-03-01', '2023-06-01', true),
    (2, 2, 1000, 20.00, 100, '2023-03-15', '2023-09-15', false),
    (3, 3, 750, 15.00, 50, '2023-04-01', '2023-08-01', true),
    (4, 4, 600, 12.00, 100, '2023-04-15', '2023-10-15', false),
    (5, 5, 800, 18.00, 100, '2023-05-01', '2023-11-01', true),
    (6, 6, 900, 22.00, 100, '2023-05-15', '2023-12-15', false),
    (7, 7, 700, 14.00, 100, '2023-06-01', '2024-01-01', true),
    (8, 8, 500, 16.00, 50, '2023-06-15', '2024-02-15', false),
    (9, 9, 850, 19.00, 50, '2023-07-01', '2024-03-01', true),
    (10, 10, 950, 25.00, 50, '2023-07-15', '2024-04-15', false);

INSERT INTO purchases(id, investment_id, user_id, shares_purchased, cost_per_share, purchase_date, status)
VALUES
    (1, 1, 1, 100, 10.00, '2023-03-02', 'completed'),
    (2, 2, 2, 100, 20.00, '2023-03-16', 'pending'),
    (3, 3, 3, 100, 15.00, '2023-04-02', 'completed'),
    (4, 4, 4, 60, 12.00, '2023-04-16', 'expired'),
    (5, 5, 5, 80, 18.00, '2023-05-02', 'completed'),
    (6, 6, 6, 90, 22.00, '2023-05-16', 'pending'),
    (7, 7, 7, 70, 14.00, '2023-06-02', 'completed'),
    (8, 8, 8, 50, 16.00, '2023-06-16', 'expired'),
    (9, 9, 9, 85, 19.00, '2023-07-02', 'completed'),
    (10, 10, 10, 95, 25.00, '2023-07-16', 'pending');

-- run the following line in the psql shell to load this file
-- \i data/fastcapitaldata.sql
