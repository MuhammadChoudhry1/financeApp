-- Create the expenses table
CREATE TABLE expenses (
    id VARCHAR(36) PRIMARY KEY,  -- Use 36 if using UUIDs
    description VARCHAR(255) NOT NULL, -- Use VARCHAR instead of TEXT for indexing
    amount DECIMAL(12,2) NOT NULL, -- Increased for higher financial values
    category VARCHAR(100) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP -- Ensures default timestamp
);

-- Create the salaries table
CREATE TABLE salaries (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the saving_goals table
CREATE TABLE saving_goals (
    id VARCHAR(36) PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('save', 'spent', 'pending')), -- Constraint for status
    date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

