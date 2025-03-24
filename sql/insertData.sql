-- BULK INSERT for Expenses
BULK INSERT Expenses
FROM 'C:\expenses.csv'
WITH (
    FORMAT = 'CSV',
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '0x0A',  -- Line feed character for new rows
    FIRSTROW = 2  -- Skip the header row
);

-- BULK INSERT for Salaries
BULK INSERT Salaries
FROM 'C:\salaries.csv'
WITH (
    FORMAT = 'CSV',
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '0x0A',  -- Line feed character for new rows
    FIRSTROW = 2  -- Skip the header row
);

-- BULK INSERT for Saving_Goals
BULK INSERT saving_goals
FROM 'C:\saving_goals.csv'
WITH (
    FORMAT = 'CSV',
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '0x0A',  -- Line feed character for new rows
    FIRSTROW = 2  -- Skip the header row
);

-- BULK INSERT for Login
BULK INSERT login
FROM 'C:\logins.csv'
WITH (
    FORMAT = 'CSV',
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '0x0A',  -- Line feed character for new rows
    FIRSTROW = 2  -- Skip the header row
);