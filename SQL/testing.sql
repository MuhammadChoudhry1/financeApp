SELECT 
    name AS constraint_name,
    definition
FROM 
    sys.check_constraints
WHERE 
    parent_object_id = OBJECT_ID('saving_goals');