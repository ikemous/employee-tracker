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
        "Mode With Love By - Ikemous"
    ],
    {
        border: true,
        color: "default",
        borderColor: "blue",
        marginTop: 2,
        marginBottom: 2,
    });

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
            message: "Please Choose What You Would Like To Do:",
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

    inquirer.prompt([
        {
            type: "list",
            name: "table",
            message: `What would you like to ${action}?`,
            choices: userChoices
        },
    ]).then(answer =>{
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
    //Query All Departments
    const query = "SELECT * FROM `department`"
    connection.query(query, (err, res)=>{
        if(err) throw err;

        //Gather All Possible Department Choices
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
    //Query All Roles
    const roleQuery = "SELECT * FROM role";
    connection.query(roleQuery, (err, res)=>{
        if(err) throw err;
        
        //Gather All Possible Roles
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

                    inquirer.prompt([
                        {
                            type: "list",
                            name: "managerId",
                            message: "What is the employees manager id?",
                            choices: managerChoices
                        }
                    ]).then(answer=>{
                        answer.managerId = answer.managerId.split('(')[0];
                        //Update Newly Added Employee With Manager Option
                        const query = "UPDATE `employee` SET ? WHERE ?";
                        connection.query(query, 
                            [answer, {id: itemId}],(err, result)=>{
                            if(err) throw err;
                            runProgram();
                        });//End new employee update
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

        inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Please choose which item you would like to update",
                choices:  departmentChoices
            }
        ]).then(answer =>{
            answer.id = answer.id.split(')')[0];
            //Update the department
            if(action == "Update")
            {
                for(let i = 0; i < res.length; i++)
                    if(res[i].id == answer.id)
                        updateDepartment(res[i]);
            }
            else//Delete the department
                deleteFromTable("department", answer);
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

        inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Which Role would you like to update?",
                choices: roleChoices
            }
        ]).then(answer=>{
            answer.id = answer.id.split(')')[0];
            //Update Role
            if(action == "Update")
            {
                for(let i = 0; i < res.length; i++)
                    if(res[i].id == answer.id)
                        updateRole(res[i]);
            }
            else//Delete Role
                deleteFromTable("role", answer)
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
        
        inquirer.prompt([
            {
                type: "list",
                name: "id",
                message: "Please Choose which employee to edit",
                choices: employeeChoices
            }
        ]).then(answer=>{
            answer.id = answer.id.split(')')[0];
            //Update Employee
            if(action == "Update")
            {
                for(let i = 0; i < res.length; i++)
                    if(res[i].id == answer.id)
                        updateEmployee(res[i]);
            }   
            else//Delete Employee
                deleteFromTable("employee", answer)
        })
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
                    choices: managerChoices
                }
            ]).then(answers=>{
                answers.roleId = answers.roleId.split(')')[0];
                answers.managerId = answers.managerId.split(')')[0];
                updateTable("employee", answers, emp.id)
            });
        });//End Manager Query

    });//End Role Query

}//End updateEmployee()

//#endregion programfunctions

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
    connection.query(query,[table,information],
    function(err, res) {
        if (err) throw err;
        console.log(res.affectedRows + ` ${table} added!\n`);
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
    connection.query(query,
        table,
        (err, res) =>{
            if(err) throw err;
            console.log('\n')
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
        console.log('\n');
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
        ],
        (err,res) =>{
            if(err) throw err;
            console.log("Row updated \n");
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
    connection.query(query, 
        [table, itemId],
        (err, res)=>{
            if(err) throw err;
            console.log("Row Deleted \n");
            runProgram();
    })

}//End deleteFromTable

//#endregion sqlQueryFunctions