// Import depenencies
const inquirer = require("inquirer");//Used To Ask Questions in the Console
const mysql = require("mysql");//Used to Modify or obtain SQL informations
const table = require("console.table");//Used to Display SQL information
const printMessage = require('print-message');// Used for the Greeting Message
const emoji = require('node-emoji');//EMOJIIII!!!!!!!

// Create Connection to the sql
// Information will need to be changed for your sql server
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "secret",
    database: "employeeDB"
});

// Connect SQL to create queries
connection.connect(err =>{
    if(err) throw err;


    printMessage([
        "Welcome To The Employee Tracker!!!",
        "Please Follow The Prompts To Alter Your Employee",
        "Database To Your Needs!!!",
        "Mode With Love By - Ikemous"
    ],
    {
        border: true,
        color: "default",
        borderColor: "blue",
        marginTop: 2,
        marginBottom: 2,
    });

    runProgram();

});

function runProgram()
{
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Please Choose What You Would Like To Do:",
            choices: [
                "View",
                "Add",
                "Update",
                "Delete"
            ]
        }
    ]).then(answer =>{
        actionChoice(answer.action)
    })
}


//#region  validations

/**
 * checkNumber()
 * Purpose: Check if given variable is a number
 * Parameters: salary - Number To Be Checked
 * Return: boolean of True(Variable is a Number) or False(Variable isn't a number) 
 */
const checkNumber = number =>{
    number = parseInt(number);
    if(isNaN(number))
    {
        console.log("Please Input A Number");
        return false;
    }
    return true;
}//End checkNumber()

/**
 * checkName()
 * Purpose: Check if given variable is a string
 * Parameters: name - Variable to be checked
 * Return: boolean of True(Variable is a string) or False(Variable isn't a string) 
 */
const checkString = string =>{
    if(string !== '')
        return true;
    console.log("Please Input A SomeText");
    return false;
}//End checkName()

//#endregion validations


//#region programFunctions

function actionChoice(action)
{
    let userChoices = ["department", "role", "employee"];
    if(action === "View")
        userChoices.push("all");

    inquirer.prompt([
        {
            type: "list",
            name: "table",
            message: `What would you like to ${action}?`,
            choices: userChoices
        },
    ]).then(answer =>{
        switch(action)
        {
            case "View":
                if(answer.table === "all")
                {
                    viewAllInformation();
                    break;
                }
                viewTable(answer.table);
                break;
            case "Add":
                switch(answer.table)
                {
                    case "department":
                        addDepartmentQuestions();
                        break;
                    case "role":
                        addRoleQuestions();
                        break;
                    case "employee":
                        addEmployeeQuestions();
                        break;
                    default:
                        break;
                }
                break;
            case "Update":
            case "Delete":
                switch(answer.table)
                {
                    case "department":
                        chooseDepartment(action);
                        break;
                    case "role":
                        chooseRole(action);
                        break;
                    case "employee":
                        chooseEmployee(action);
                        break;
                    default:
                        break;
                }
                break;
            default:
                break;
        }
    });
}

function addDepartmentQuestions()
{
    inquirer.prompt([
        {
            type: "input",
            name: "department",
            message: "What is the department name?",
            validate: checkString
        }
    ]).then(answer=>{
        insertIntoTable("department", answer);
    });
}

function addRoleQuestions()
{
    const query = "SELECT * FROM `department`"
    connection.query(query, (err, res)=>{
        if(err) throw err;

        let depChoices = [];
        for(let i = 0; i < res.length; i++)
            depChoices.push(`${res[i].id}) ${res[i].department}`);

        inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "What is the new role title?",
                validate: checkString
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary for this role?",
                validate: checkNumber
            },
            {
                type: "list",
                name: "departmentId",
                message: "Please select the roles department ID",
                choices: depChoices
            },
        ]).then(answers=>{
            answers.departmentId = answers.departmentId.split(')')[0];
            insertIntoTable("role", answers);
        }); 
    });
}

function addEmployeeQuestions()
{
    const roleQuery = "SELECT * FROM role";
    connection.query(roleQuery, (err, res)=>{
        if(err) throw err;
        
        let roleChoices = [];
        for(let i = 0; i < res.length; i++)
            roleChoices.push(`${i + 1}) ${res[i].title}`);

            inquirer.prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "What is the employees first name?",
                    validate: checkString
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "What is the employees last name?",
                    validate: checkString
                },
                {
                    type: "list",
                    name: "roleId",
                    message: "What is the employees role id?",
                    choices: roleChoices
                }
            ]).then(answers=>{
                answers.roleId = answers.roleId.split(')')[0];
                const query = "INSERT INTO `employee` SET ?";
                connection.query(query, answers, (err, insertRes)=>{
                    if(err) throw err;

                    // console.log(insertRes);
                    const itemId = insertRes.insertId
                    // console.log(id);

                    const managerQuery = `SELECT T1.id, CONCAT(T1.firstName, ' ', T1.lastName) AS 'Manager'
                    FROM employee AS T1
                    INNER JOIN role AS T2 ON T1.roleId = T2.id
                    WHERE T2.title = "Manager"`;
                    connection.query(managerQuery, (err, res)=>{
                        if(err) throw err;
            
                        let managerChoices = [];
                        for(let i = 0; i < res.length; i++)
                            managerChoices.push(`${res[i].id}(ID) ${res[i].Manager}`);


                        inquirer.prompt([
                            {
                                type: "list",
                                name: "managerId",
                                message: "What is the employees manager id?",
                                choices: managerChoices
                            }
                        ]).then(answer=>{
                            answer.managerId = answer.managerId.split('(')[0];
                            const query = "UPDATE `employee` SET ? WHERE ?";
                            connection.query(query, 
                                [answer, {id: itemId}],(err, result)=>{
                                if(err) throw err;
                                runProgram();

                            });
                        });
                    });
                });
            });
    });
            
}

function chooseDepartment(action)
{
    const query = "SELECT * FROM `department`"
    connection.query(query, (err, res)=>{
        if(err) throw err;

        let departmentChoices = [];
        for(let i = 0; i < res.length; i++)
            departmentChoices.push(`${res[i].id}) ${res[i].department}`);

        inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Please choose which item you would like to update",
                choices:  departmentChoices
            }
        ]).then(answer =>{
            answer.id = answer.id.split(')')[0];
            if(action == "Update")
            {
                for(let i = 0; i < res.length; i++)
                    if(res[i].id == answer.id)
                        updateDepartment(res[i]);
            }
            else
                deleteFromTable("department", answer);
        });
    });
}

function updateDepartment(dep)
{
    inquirer.prompt([
        {
            type: "input",
            name: "department",
            message: `Enter new department name or press (Enter)`,
            default: dep.department
        }
    ]).then(answer =>{
        updateTable("department", answer, dep.id)
    })
}

function chooseRole(action)
{
    const query = "SELECT * FROM role";
    connection.query(query, (err, res)=>{
        if(err) throw err;
        
        let roleChoices = [];
        for(let i = 0; i < res.length; i++)
            roleChoices.push(`${res[i].id}) ${res[i].title}`);

        inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Which Role would you like to update?",
                choices: roleChoices
            }
        ]).then(answer=>{
            answer.id = answer.id.split(')')[0];
            if(action == "Update")
            {
                for(let i = 0; i < res.length; i++)
                    if(res[i].id == answer.id)
                        updateRole(res[i]);
            }
            else
                deleteFromTable("role", answer)
        });
    });
}

function updateRole(theRole)
{
    const query = "SELECT * FROM department";
    connection.query(query, (err, res)=>{
        if(err) throw err;
        
        let departmentChoices = [];
        for(let i = 0; i < res.length; i++)
            departmentChoices.push(`${i + 1}) ${res[i].department}`);
        
        inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "Enter new title or press (Enter)",
                default: theRole.title
            },
            {
                type: "input",
                name: "salary",
                message: "Please enter updated salary or press (Enter)",
                default: theRole.salary,
                validate: checkNumber
            },
            {
                type: "list",
                name: "departmentId",
                message: "Please Select The Department",
                choices: departmentChoices
            }
        ]).then(answer=>{
            answer.departmentId = answer.departmentId.split(')')[0];
            updateTable("role", answer, theRole.id);
        });
    });

}

function chooseEmployee(action)
{
    const query = "SELECT * FROM `employee`";
    connection.query(query, (err, res)=>{
        if(err) throw err;
        let employeeChoices = [];
        for(let i = 0; i < res.length; i++)
            employeeChoices.push(`${res[i].id}) ${res[i].firstName} ${res[i].lastName}`);
        
            inquirer.prompt([
                {
                    type: "list",
                    name: "id",
                    message: "Please Choose which employee to edit",
                    choices: employeeChoices
                }
            ]).then(answer=>{
                answer.id = answer.id.split(')')[0];
                if(action == "Update")
                {
                    for(let i = 0; i < res.length; i++)
                        if(res[i].id == answer.id)
                            updateEmployee(res[i]);
                }   
                else
                    deleteFromTable("employee", answer)
            })
    });
}

function updateEmployee(emp)
{
    console.table(emp)
    const roleQuery = "SELECT `id`, `title` FROM `role`";
    connection.query(roleQuery, (err, res)=>{
        if(err) throw err;
        
        let roleChoices = [];
        for(let i = 0; i < res.length; i++)
            roleChoices.push(`${res[i].id}) ${res[i].title}`);
        
        const departmentQuery =`SELECT T1.id, CONCAT(T1.firstName, ' ', T1.lastName) AS 'Manager'
        FROM employee AS T1
        INNER JOIN role AS T2 ON T1.roleId = T2.id
        WHERE T2.title = "Manager";`
        connection.query(departmentQuery, (err, res)=>{
            if(err) throw err;

            console.table(res)
            let departmentChoices = [];
            for(let i = 0; i < res.length; i++)
                departmentChoices.push(`${res[i].id}) ${res[i].Manager}`);
            
            inquirer.prompt([
                {
                    type: "input",
                    name: "firstName",
                    message: "Please enter updated name or press (Enter)",
                    default: emp.firstName,
                    validate: checkString
                },
                {
                    type: "input",
                    name: "lastName",
                    message: "Please enter updated name or press (Enter)",
                    default: emp.lastName,
                    validate: checkString
                },
                {
                    type: "list",
                    name: "roleId",
                    message: "Please pick employee Role",
                    choices: roleChoices
                },
                {
                    type: "list",
                    name: "managerId",
                    message: "Please pick employee Manager",
                    choices: departmentChoices
                }
            ]).then(answers=>{
                answers.roleId = answers.roleId.split(')')[0];
                answers.managerId = answers.managerId.split(')')[0];
                updateTable("employee", answers, emp.id)
            });
        })
    })

}

//#endregion programfunctions

//#region sqlQueryFunctions
// CREATE
function insertIntoTable(table, information)
{
    const query = "INSERT INTO ?? SET ?";
    connection.query(query,[table,information],
    function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + ` ${table} added!\n`);
        runProgram();
    });
}

// READ
function viewTable(table)
{
    const query = "SELECT * FROM ??";
    connection.query(query,
        table,
        (err, res) =>{
            if(err) throw err;
            console.log('\n')
            console.table(res);
            runProgram();
        });
}

function viewAllInformation()
{
    const query = `SELECT main.id, CONCAT(main.firstName, ' ', main.lastName) AS Name, second.title, second.salary, third.department, CONCAT(manager.firstName, ' ', manager.lastName) AS Manager
    FROM employee AS main
    LEFT JOIN role AS second ON (second.id = main.roleId)
    LEFT JOIN department AS third ON (third.id = second.departmentId)
    LEFT JOIN employee AS manager ON (manager.id = main.managerId);`

    connection.query(query, (err, res)=>{
        if(err) throw err;
        console.log('\n');
        console.table(res);
        runProgram();
    });
}

// UPDATE
function updateTable(table, information, itemId)
{
    const query = "UPDATE ?? SET ? WHERE ?";
    connection.query(query, 
        [
            table,
            information,
            {
                id: itemId
            }
        ],
        (err,res) =>{
            if(err) throw err;
            console.log("Row updated \n");
            runProgram(); 
        });
}

// DELETE
function deleteFromTable(table, itemId)
{
    const query = "DELETE FROM ?? WHERE ?";
    connection.query(query, 
        [table, itemId],
        (err, res)=>{
        if(err) throw err;
        console.log("Row Deleted \n");
        runProgram();
    })

}
//#endregion sqlQueryFunctions