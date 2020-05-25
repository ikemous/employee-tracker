USE employeeDB;

INSERT INTO department(department)
VALUES("Sales"),
("Engineering"),
("Management");

INSERT INTO role(title, salary, departmentId)
VALUES("Sales Associate", 25000, 1),
("Engineer Associate", 45000, 2),
("Manager", 80000, 3);

INSERT INTO employee(firstName, lastName, roleId, managerId)
VALUES("Scoobert", "Doo", 1, 2),
("Shaggy", "Rogers", 3, 2),
("Velma", "Dinkly", 3, 3),
("Freddy", "Jones", 2, 3),
("Daphne", "Blake", 2, 3);
