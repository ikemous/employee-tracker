// Import depenencies
const inquirer = require("inquirer");//Used To Ask Questions in the Console
const mysql = require("mysql");//Used to Modify or obtain SQL informations
const table = require("console.table");//Used to Display SQL information
const printMessage = require('print-message');// Used for the Greeting Message

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

    //Beginning Program Message
    printMessage([
        "Welcome To The Employee Tracker!!!",
        "Please Follow The Prompts To Alter Your Employee",
        "Database To Your Needs!!!",
        "To Have Any Managers You Must Have A Manager Role",
        "Mode With Love By - Ikemous"
    ],
    {
        border: true,
        color: "default",
        borderColor: "blue",
        marginTop: 2,
        marginBottom: 2,
    });//End Program Message

    //Start The Program
    runProgram();

});

/**
 * runProgram()
 * Purpose: Ask The user waht action they would like to do then end or continue program
 * Parameters: None
 * Return: None
 */
function runProgram()
{
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "Please Choose What You Would Like To Do To The Database:",
            choices: [
                "View",
                "Add",
                "Update",
                "Delete",
                "Exit"
            ]
        }
    ]).then(answer =>{
        if(answer.action === "Exit")
            connection.end();
        else
            actionChoice(answer.action);
    })
}//End runProgram()


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

/**
 * actionChoice()
 * Purpose: Allow user to choose department they would like thier action to do
 * Parameters: action - String of what the user chose to do(ADD, DELETE, UPDATE, VIEW)
 * Return: None
 */
function actionChoice(action)
{
    let userChoices = ["department", "role", "employee"];
    if(action === "View")
        userChoices.push("all");
    userChoices.push("Back");
    inquirer.prompt([
        {
            type: "list",
            name: "table",
            message: `What would you like to ${action}?`,
            choices: userChoices
        },
    ]).then(answer =>{

        if(answer.table === "Back")
            runProgram();
        else
        {
            //check User Action Choice
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
        }
        

    });
}//End actionChoice()

/**
 * addDepartmentQuestions()
 * Purpose: Gather department info and insert into the table
 * Parameters: None
 * Return: None
 */
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
        answer.department = capitalize_Words(answer.department);
        insertIntoTable("department", answer);
    });
}//End addDepartmentQuestions

/**
 * addRoleQuestions()
 * Purpose: Gather information for the new role and insert them into the query
 * Parameters: None
 * Return: None
 */
function addRoleQuestions()
{
    //Beginning Program Message
    printMessage([
        'To Have Any Managers You Must Have A "Manager" Role'
    ],
    {
        border: true,
        color: "default",
        borderColor: "blue"
    });//End Program Message

    //Query All Departments
    const query = "SELECT * FROM `department`"
    connection.query(query, (err, res)=>{
        if(err) throw err;

        //Gather All Possible Department Choices
        let depChoices = [];
        for(let i = 0; i < res.length; i++)
            depChoices.push(`${res[i].id}) ${res[i].department}`);
        
        depChoices.push("None");

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
            if(answers.departmentId == "None")
                answers.departmentId = null;
            else
                answers.departmentId = answers.departmentId.split(')')[0];
            answers.title = capitalize_Words(answers.title);

            insertIntoTable("role", answers);
        }); 
    });//End Deparment Query
}//End addRoleQuestions()

/**
 * addEmployeeQuestions()
 * Purpose: Check if given variable is a number
 * Parameters: salary - Number To Be Checked
 * Return: boolean of True(Variable is a Number) or False(Variable isn't a number) 
 */
function addEmployeeQuestions()
{
    //Beginning Program Message
    printMessage([
        'To Be Recognized as a Manager The Employee Must Be',
        'Assigned To A "Manager" Role. You May Update The ',
        'Employee Later If You Haven\'t Created It Yet'
    ],
    {
        border: true,
        color: "default",
        borderColor: "blue"
    });//End Program Message


    //Query All Roles
    const roleQuery = "SELECT * FROM role";
    connection.query(roleQuery, (err, res)=>{
        if(err) throw err;
        
        //Gather All Possible Roles
        let roleChoices = [];
        for(let i = 0; i < res.length; i++)
            roleChoices.push(`${i + 1}) ${res[i].title}`);
        roleChoices.push("None");

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
            if(answers.roleId === "None")
                answers.roleId = null;
            else
                answers.roleId = answers.roleId.split(')')[0];
            answers.firstName = capitalize_Words(answers.firstName);
            answers.lastName = capitalize_Words(answers.lastName);

            //Insert Employee Prior To Asking For Manager
            const query = "INSERT INTO `employee` SET ?";
            connection.query(query, answers, (err, insertRes)=>{
                if(err) throw err;

                //Grab ID of Newly Added Employee
                const itemId = insertRes.insertId;

                //Query All Managers
                const managerQuery = `SELECT T1.id, CONCAT(T1.firstName, ' ', T1.lastName) AS 'Manager'
                FROM employee AS T1
                INNER JOIN role AS T2 ON T1.roleId = T2.id
                WHERE T2.title = "Manager"`;
                connection.query(managerQuery, (err, res)=>{
                    if(err) throw err;
                    //Gather All Possible Managers
                    let managerChoices = [];
                    for(let i = 0; i < res.length; i++)
                        managerChoices.push(`${res[i].id}(ID) ${res[i].Manager}`);
                    managerChoices.push("None");
                    
                    inquirer.prompt([
                        {
                            type: "list",
                            name: "managerId",
                            message: "What is the employees manager id?",
                            choices: managerChoices
                        }
                    ]).then(answer=>{
                        if(answer.managerId == "None")
                            answer.managerId = null;
                        else
                            answer.managerId = answer.managerId.split('(')[0];
                        
                        updateTable("employee", answer, itemId);

                    });
                });//End Manager Query

            });//End New Employee Insert Query
        });
    });//End Role Query
            
}//End addEmployeeQuestions()

/**
 * chooseDepartment()
 * Purpose: Allow The User select a department to alter
 * Parameters: action - action chosen by the user at the start of the program
 * Return: None
 */
function chooseDepartment(action)
{
    //Query To Grab all departments
    const query = "SELECT * FROM `department`"
    connection.query(query, (err, res)=>{
        if(err) throw err;
        //Grab all current departments
        let departmentChoices = [];
        for(let i = 0; i < res.length; i++)
            departmentChoices.push(`${res[i].id}) ${res[i].department}`);
        departmentChoices.push("None");

        inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Please choose which item you would like to update",
                choices:  departmentChoices
            }
        ]).then(answer =>{
            if(answer.id === "None")
                runProgram()
            else
            {
                answer.id = answer.id.split(')')[0];
                console.log(answer.id);
                //Update the department
                if(action == "Update")
                {
                    for(let i = 0; i < res.length; i++)
                        if(res[i].id == answer.id)
                            updateDepartment(res[i]);
                }
                else//Delete the department
                    deleteFromTable("department", answer);
            }
                
        });
    });//End Department query

}//End chooseDepartment()

/**
 * updateDepartment()
 * Purpose: update department chosen
 * Parameters: dep - department information to be updated
 * Return: None 
 */
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
        answer.department = capitalize_Words(answer.department);
        updateTable("department", answer, dep.id)
    })
}//End updateDepartment

/**
 * chooseRole()
 * Purpose: Check if given variable is a number
 * Parameters: salary - Number To Be Checked
 * Return: boolean of True(Variable is a Number) or False(Variable isn't a number) 
 */
function chooseRole(action)
{
    //Query all role ingformation
    const query = "SELECT * FROM role";
    connection.query(query, (err, res)=>{
        if(err) throw err;
        //Grab all possible Roles
        let roleChoices = [];
        for(let i = 0; i < res.length; i++)
            roleChoices.push(`${res[i].id}) ${res[i].title}`);
        roleChoices.push("None");

        inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Which Role would you like to update?",
                choices: roleChoices
            }
        ]).then(answer=>{
            if(answer.id === "None")
                runProgram();
            else
            {
                answer.id = answer.id.split(')')[0];
                //Update Role
                if(action == "Update")
                {
                    for(let i = 0; i < res.length; i++)
                        if(res[i].id == answer.id)
                            updateRole(res[i]);
                }
                else//Delete Role
                    deleteFromTable("role", answer);
            }
        });
    });//End all role query
}//end chooseRole

/**
 * updateRole()
 * Purpose: Update Selected Role
 * Parameters: theRole - The Role Chosen To Be Updated
 * Return: None 
 */
function updateRole(theRole)
{
    //Query All Possible Departments
    const query = "SELECT * FROM department";
    connection.query(query, (err, res)=>{
        if(err) throw err;
        //Grab all possible departments
        let departmentChoices = [];
        for(let i = 0; i < res.length; i++)
            departmentChoices.push(`${i + 1}) ${res[i].department}`);
        departmentChoices.push("None");
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
        ]).then(answers=>{
            if(answers.departmentId == "None")
                answers.departmentId = null;
            else
                answers.departmentId = answers.departmentId.split(')')[0];
            answers.title = capitalize_Words(answers.title);
            updateTable("role", answers, theRole.id);
        });
    });//End Departments query

}//End updateRole()

/**
 * chooseEmployee()
 * Purpose: Allow User To Choose an emplouyee
 * Parameters: action - Action chosen by user at the start of the program
 * Return: None 
 */
function chooseEmployee(action)
{
    //Query All Employees
    const query = "SELECT * FROM `employee`";
    connection.query(query, (err, res)=>{
        if(err) throw err;
        //Grab all possible employees
        let employeeChoices = [];
        for(let i = 0; i < res.length; i++)
            employeeChoices.push(`${res[i].id}) ${res[i].firstName} ${res[i].lastName}`);
        employeeChoices.push("None");
        inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Please Choose which employee to edit",
                choices: employeeChoices
            }
        ]).then(answer=>{
            if(answer.id === "None")
                runProgram();
            else
            {
                answer.id = answer.id.split(')')[0];
                //Update Employee
                if(action == "Update")
                {
                    for(let i = 0; i < res.length; i++)
                        if(res[i].id == answer.id)
                            updateEmployee(res[i]);
                }   
                else//Delete Employee
                    deleteFromTable("employee", answer);
            }
        });
    });//End all employee Query

}//End chooseEmployee

/**
 * updateEmployee()
 * Purpose: Update Chosen Employees Information
 * Parameters: emp - all information of chosen employee
 * Return: None
 */
function updateEmployee(emp)
{
    //Query Roles
    const roleQuery = "SELECT `id`, `title` FROM `role`";
    connection.query(roleQuery, (err, res)=>{
        if(err) throw err;
        //Grab All Possbile Roles
        let roleChoices = [];
        for(let i = 0; i < res.length; i++)
            roleChoices.push(`${res[i].id}) ${res[i].title}`);
        roleChoices.push("None");
        
        //Query All Manager Information
        const managerQuery =`SELECT T1.id, CONCAT(T1.firstName, ' ', T1.lastName) AS 'Manager'
        FROM employee AS T1
        INNER JOIN role AS T2 ON T1.roleId = T2.id
        WHERE T2.title = "Manager";`
        connection.query(managerQuery, (err, res)=>{
            if(err) throw err;
            //Grab all Manager Choices
            let managerChoices = [];
            for(let i = 0; i < res.length; i++)
                managerChoices.push(`${res[i].id}) ${res[i].Manager}`);
            managerChoices.push("None");
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
                // {
                //     type: "list",
                //     name: "managerId",
                //     message: "Please pick employee Manager",
                //     choices: managerChoices
                // }
            ]).then(answers=>{
                if(answers.roleId == "None")
                    answers.roleId = null;
                else
                    answers.roleId = answers.roleId.split(')')[0];
                // if(answers.managerId == "None")
                //     answers.managerId = null;
                // else
                //     answers.managerId = answers.managerId.split(')')[0];
                answers.firstName = capitalize_Words(answers.firstName);
                answers.lastName = capitalize_Words(answers.lastName);

                const updateEmployeeQuery = "UPDATE employee SET ? WHERE ?";
                connection.query(updateEmployeeQuery, 
                [
                    answers, 
                    {
                        id: emp.id
                    }
                ],
                (err,res)=>{
                    if(err) throw err;
                    //Query All Managers
                    const managerQuery = `SELECT T1.id, CONCAT(T1.firstName, ' ', T1.lastName) AS 'Manager'
                    FROM employee AS T1
                    INNER JOIN role AS T2 ON T1.roleId = T2.id
                    WHERE T2.title = "Manager"`;
                    connection.query(managerQuery, (err, res)=>{
                        if(err) throw err;
                        //Gather All Possible Managers
                        let managerChoices = [];
                        for(let i = 0; i < res.length; i++)
                            managerChoices.push(`${res[i].id}(ID) ${res[i].Manager}`);
                        managerChoices.push("None");
                        
                        inquirer.prompt([
                            {
                                type: "list",
                                name: "managerId",
                                message: "What is the employees manager id?",
                                choices: managerChoices
                            }
                        ]).then(answer=>{
                            if(answer.managerId == "None")
                                answer.managerId = null;
                            else
                                answer.managerId = answer.managerId.split('(')[0];
                            
                            updateTable("employee", answer, emp.id);

                        });
                    });//End Manager Query
                    
                });
                // updateTable("employee", answers, emp.id)
            });
        });//End Manager Query

    });//End Role Query

}//End updateEmployee()


//#endregion programfunctions

//#region helperFunctions

/**
 * capitalize_Words()
 * Purpose: To Take a string and capatilize every word after a space
 * Parameters: str - String to be altered
 * Return: str - Altered by Making every word after to be uppercase
 * Reference: https://www.w3resource.com/javascript-exercises/javascript-string-exercise-9.php
 */
function capitalize_Words(str)
{
    return str.replace(/\w\S*/g, txt=>{return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}//End capitalize_Words()   

/**
 * printQueryStatus()
 * Purpose: Print the status message with given information from query
 * Parameters:id - ID updated, deleted or added
 *            table - table altered
 *            action - table alteration that occured
 * Return: None
 */
function printQueryStatus(id, table, action)
{
    //Beginning Program Message
    printMessage([`Id ${id} For Table ${table} ${action}`],
    {
        border: true,
        color: "default",
        borderColor: "blue",
        marginBottom: 2,
    });//End Program Message
}//end printQueryStatus()

//#endregion helperFunctions

//#region sqlQueryFunctions

/**
 * insertIntoTable()
 * Purpose: Insert Information into an SQL Table
 * Parameters:table - Database table for information to be added too
 *            information - All Information to be added into the table
 * Return: None
 */
function insertIntoTable(table, information)
{
    const query = "INSERT INTO ?? SET ?";
    connection.query(query,[table,information],(err, res)=>{
        if (err) throw err;
        printQueryStatus(res.insertId, table, "Added")
        runProgram();
    });
}//End insertIntoTable

/**
 * viewTable()
 * Purpose: View All Information on the selected Table
 * Parameters: table - Table chosen to be viewed
 * Return: None
 */
function viewTable(table)
{
    const query = "SELECT * FROM ??";
    connection.query(query,table,(err, res) =>{
            if(err) throw err;
            printMessage([`Viewing Information From ${table} Table`],
            {
                border: true,
                color: "default",
                borderColor: "blue"
            });
            console.table(res);
            runProgram();
    });
}//End viewTable

/**
 * viewAllInformation()
 * Purpose: View All information of the employees In One Table
 * Parameters: None
 * Return: None
 */
function viewAllInformation()
{
    const query = `SELECT main.id, CONCAT(main.firstName, ' ', main.lastName) AS Name, second.title, second.salary, third.department, CONCAT(manager.firstName, ' ', manager.lastName) AS Manager
    FROM employee AS main
    LEFT JOIN role AS second ON (second.id = main.roleId)
    LEFT JOIN department AS third ON (third.id = second.departmentId)
    LEFT JOIN employee AS manager ON (manager.id = main.managerId);`
    connection.query(query, (err, res)=>{
        if(err) throw err;
        printMessage([`Viewing All Combined Information`],
        {
            border: true,
            color: "default",
            borderColor: "blue"
        });//End Program Message
        console.table(res);
        runProgram();
    });
}//End viewAll Information()

/**
 * updateTable()
 * Purpose: Update Chosen Table with sent information
 * Parameters: table - Table that the information needs to be added to
 *             information - All Information to be updated in the table
 *             itemId - Id of the row to be updated
 * Return: None
 */
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
        ],(err,res) =>{
            if(err) throw err;
            printQueryStatus(itemId, table, "Updated");
            runProgram(); 
        });
}//End updatedTable()

/**
 * deleteFromTable()
 * Purpose: delete id item from a table
 * Parameters: table - Table to have the id deleted from
 *             itemId - id to be deleted
 * Return: None
 */
function deleteFromTable(table, itemId)
{
    const query = "DELETE FROM ?? WHERE ?";
    connection.query(query, [table, itemId],(err, res)=>{
        if(err) throw err;
        printQueryStatus(itemId.id, table, "Deleted");
        runProgram();
    });
}//End deleteFromTable

//#endregion sqlQueryFunctions