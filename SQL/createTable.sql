-- Create the expenses table
CREATE TABLE expenses (
    id VARCHAR(24) PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    date TIMESTAMP NOT NULL
);

-- Create the salaries table
CREATE TABLE salaries (
    id VARCHAR(24) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    date TIMESTAMP NOT NULL
);

-- Create the saving_goals table
CREATE TABLE saving_goals (
    id VARCHAR(24) PRIMARY KEY,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL,
    date TIMESTAMP NOT NULL
);
