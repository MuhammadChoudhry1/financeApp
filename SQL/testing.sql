BULK INSERT Expenses
FROM '/expenses.csv'
WITH (
    FIELDTERMINATOR = ',',  
    ROWTERMINATOR = '\n',
    FIRSTROW = 2
);

BULK INSERT Salaries
FROM '/salaries.csv'
WITH (
    FIELDTERMINATOR = ',',  
    ROWTERMINATOR = '\n',
    FIRSTROW = 2
);

BULK INSERT saving_goals
FROM '/Saving_Goals.csv'
WITH (
    FIELDTERMINATOR = ',',  
    ROWTERMINATOR = '\n',
    FIRSTROW = 2
);