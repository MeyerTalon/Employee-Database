INSERT INTO departments (name)
VALUES ("Sales"),
       ("Engineering"),
       ("Finance"),
       ("Legal");
       

INSERT INTO roles (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1),
       ("Salesperson", 80000, 1),
       ("Lead Engineer", 150000, 2),
       ("Software Engineer", 120000, 2),
       ("Account Manager", 90000, 3),
       ("Legal Team Lead", 200000, 4),
       ("Lawyer", 100000, 4);

INSERT INTO employees(first_name, last_name, role_id, manager_id)
VALUES ("Joe", "Smith", 1, NULL),
       ("Ronny", "McDonald", 3, 1);