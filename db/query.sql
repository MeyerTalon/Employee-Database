SELECT * FROM roles JOIN departments ON roles.department_id = departments.id;
SELECT * FROM employees JOIN roles ON employees.role_id = roles.id;
-- SELECT * FROM employees JOIN departments ON employees.department_id = departments.id;
