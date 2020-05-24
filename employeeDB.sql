-- drop db if exists
DROP DATABASE IF EXISTS employeeDB;

-- create db 
CREATE DATABASE employeeDB;

-- user this db
USE employeeDB;

-- create table 1
CREATE TABLE department(
    id INTEGER(11) AUTO_INCREMENT NOT NULL,
    department VARCHAR(30) NOT NULL,
    PRIMARY KEY(id)
);

-- create table 2
CREATE TABLE role(
    id INTEGER(11) AUTO_INCREMENT NOT NULL,
    title VARCHAR(30) NOT NULL,
    salary DECIMAL(15,2),
    departmentId INTEGER(11),
    PRIMARY KEY(id)
);

-- create table 3
CREATE TABLE employee(
    id INTEGER(11) AUTO_INCREMENT NOT NULL,
    firstName VARCHAR(30) NOT NULL,
    lastName VARCHAR(30) NOT NULL,
    roleId INTEGER(11),
    managerId INTEGER(11),
    PRIMARY KEY(id)
);