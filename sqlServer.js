// Import depenencies
const inquirer = require("inquirer");
const mysql = require("mysql");
const table = require("console.table");

function initialQuestion()
{
    return inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What would you like to do?",
            choices: ["add", "view", "update"]
        }
    ]);
}

function pickTableQuestions(action)
{
    return inquirer.prompt([
        {
            type: "list",
            name: "table",
            message: `Which would you like to ${action}`,
            choices: ["department", "role", "employee"]
        }
    ]);
}

function addDeparmentQuestions()
{
    return inquirer.prompt([
        {
            type: "input",
            name: "name",
            message: "What is the department name?"
        }
    ]);
}

function addRoleQuestions()
{
    return inquirer.prompt([
        {
            type: "input",
            name: "roleTitle",
            message: "What is the new role title?"
        },
        {
            type: "input",
            name: "roleSalary",
            message: "What is the salary for this role?"
        },
        {
            type: "input",
            name: "departmentId",
            message: "What is the department id?"
        }
    ]);
}

function addEmployeeQuestions()
{
    return inquirer.prompt([
        {
            type: "input",
            name: "first",
            message: "What is the employees first name?",
            validate: function checkName(firstName)
            {
                if(firstName !== '')
                    return true;
                console.log("Please Input A Name")
                return false;
            }
        },
        {
            type: "input",
            name: "last",
            message: "What is the employees last name?",
            validate: function checkName(lastName)
            {
                if(lastName !== '')
                    return true;
                console.log("Please Input A Name")
                return false;
            }
        },
        {
            type: "input",
            name: "roleId",
            message: "What is the employees role id?",
            validate: function checkNumber(roleId)
            {
                roleId = parseInt(roleId);
                if(isNaN(roleId))
                {
                    console.log("Please Input A Number");
                    return false;
                }
                return true;
            }
        },
        {
            type: "input",
            name: "managerId",
            message: "What is the employees manager id?",
            validate: function checkNumber(roleId)
            {
                roleId = parseInt(roleId);
                if(isNaN(roleId))
                {
                    console.log("Please Input A Number");
                    return false;
                }
                return true;
            }
        }
    ]);
}


// Create Connection to the sql\
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employeeDB"
})

// Connect SQL to create queries
connection.connect(async err =>{
    if(err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    
    const action = await initialQuestion();
    const table = await pickTableQuestions(action.action);
    switch(action.action)
    {
        case "add":
            switch(table.table)
            {
                case "department":
                    const addedDepartment = await addDeparmentQuestions();
                    insertIntoTable(table.table, addedDepartment);
                    viewTable(table.table);
                    break;
                case "role":
                    break;
                case "employee":
                    break;
                default:
                    break;
            }
            break;
        case "view":
            viewTable(table.table)
            break;
        case "update":
            break;
        default:
            break;
    }
});

// CREATE
function insertIntoTable(table, information)
{
    const query = "INSERT INTO ?? SET ?";
    console.log(table);
    console.log(information);
    connection.query(query,[table,information],
    function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + " product inserted!\n");
    });
}

// READ
function viewTable(table)
{
    const query = "SELECT * FROM department";
    connection.query(query,
        table,
        (err, res) =>{
            if(err) throw err;
            console.log(res);
        });
}

// UPDATE

// DELETE