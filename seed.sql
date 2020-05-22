-- user this db
USE employeeDB;

-- INSERT INTO department(department)
-- VALUES("Sales"),
-- ("Engineering"),
-- ("Management");

-- INSERT INTO role(title, salary, departmentId)
-- VALUES("Sales Associate", 25000, 1),
-- ("Engineer Associate", 45000, 2),
-- ("Manager", 80000, 3);

-- INSERT INTO employee(firstName, lastName, roleId, managerId)
-- VALUES("Scoobert", "Doo", 1, 2),
-- ("Shaggy", "Rogers", 3, 2),
-- ("Velma", "Dinkly", 3, 3),
-- ("Freddy", "Jones", 2, 3),
-- ("Daphne", "Blake", 2, 3);

-- SELECT * FROM department;
SELECT * FROM role;
-- SELECT * FROM employee;

-- DELETE FROM role
-- WHERE id = 2;

-- SELECT main.id, CONCAT(main.firstName, ' ', main.lastName) AS Name, second.title, second.salary
-- FROM employee AS main
-- LEFT JOIN role AS second ON (second.id = main.roleId);
-- SELECT main.id, CONCAT(main.firstName, ' ', main.lastName) AS Name, second.title, second.salary, third.department, CONCAT(manager.firstName, ' ', manager.lastName) AS Manager
-- FROM employee AS main
-- LEFT JOIN role AS second ON (second.id = main.roleId)
-- LEFT JOIN department AS third ON (third.id = second.departmentId)
-- LEFT JOIN employee AS manager ON (manager.id = main.managerId);


-- id first last title departmewnt salary manager


-- LEFT JOIN role USING (roleId);
-- INNER JOIN department USING role.departmentId;
