// Import depenencies
const inquirer = require("inquirer");
const mysql = require("mysql");


function addOrViewQuestions(action)
{
    return inquirer.prompt([
        {
            type: "list",
            name: "table",
            message: `Which would you like to ${action}`,
            choices: ["Departments", "Roles", "Employees"]
        }
    ]);
}

function addDeparmentQuestions()
{
    return inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "What is the department name?"
        }
    ])
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
    const table = await addOrViewQuestions(action.action);
    switch(table.table)
    {
        case "Departments":
            break;
        case "Roles":
            await addRoleQuestions();
            break;
        case "Employees":
            break;
        default:
            break;
    }
});

// CREATE
function insertIntoTable(table, information)
{

}

// READ

// UPDATE

// DELETE