-- Create the logins table
CREATE TABLE logins (
    id VARCHAR(26) PRIMARY KEY, -- Using MongoDB ObjectId format
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Storing hashed password
    email VARCHAR(255) NOT NULL UNIQUE
);