BULK INSERT Expenses
FROM 'C:\expenses.csv'
WITH (
    FORMAT='CSV',
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '0x0A',
    FIRSTROW = 2
);

BULK INSERT Salaries
FROM '\salaries.csv'
WITH (
    FORMAT='CSV',
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '0x0A',
    FIRSTROW = 2
);

BULK INSERT saving_goals
FROM '\saving_Goals.csv'
WITH (
    FORMAT='CSV',
    FIELDTERMINATOR = ',',
    ROWTERMINATOR = '0x0A',
    FIRSTROW = 2
);
