-- Assign expenses without a username to user 12 and 123
UPDATE expenses
SET username = CASE 
    WHEN ASCII(SUBSTRING(id, 1, 1)) % 2 = 0 THEN '12'  -- Assign based on ASCII value of the first character
    ELSE '123'
END
WHERE username IS NULL;
