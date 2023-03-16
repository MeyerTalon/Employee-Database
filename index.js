// Imports

const mysql = require('mysql2');
const inquirer = require('inquirer');

// SQL Database Connection

require('dotenv').config();
const db = mysql.createConnection(
    {
      host: '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    }
);
const dbPromise = db.promise();


// Query functions

const renderEmployeeTable = (callback) => {

  db.query(`SELECT employees.id, employees.first_name, employees.last_name, roles.title, departments.department, roles.salary FROM employees JOIN roles ON employees.role_id = roles.id JOIN departments ON roles.department_id = departments.id`, async (err, results) => {
    if (err) {
      console.log(err);
    }
    // const tableData = results.reduce((acc, {id, ...x}) => {acc[id] = x; return acc}, {})
    console.table(results);
  });
  setTimeout(callback, 100);
}

// db.query(`DELETE FROM course_names WHERE id = ?`, 3, (err, result) => {
  //   if (err) {
  //     console.log(err);
  //   }
  //   console.log(result);
  // });

// const join = async () => {
//     const joinTables = await db.query('SELECT * FROM roles JOIN departments ON roles.departments = departmen.id');
//     return joinTables;
// };


// Inquirer Functions

// Adds an employee to 
const addEmployeePrompt = (callback) => {
  inquirer.prompt([
    {
      type: 'input',
      name: 'firstName',
      message: 'Enter the emplopyee\'s first name: ',
      validate: (input) => {
        if (input) {
          return true;
        } else {
          console.log("Please enter the first name.");
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'lastName',
      message: 'Enter the emplopyee\'s last name: ',
      validate: (input) => {
        if (input) {
          return true;
        } else {
          console.log("Please enter the last name.");
          return false;
        }
      }
    },
    {
      type: 'list',
      message: 'Select the employee\'s role',
      name: 'role',
      choices: [1], //array of roles, tbc
  },
  {
    type: 'list',
    message: 'Select the employee\'s manager: ',
    name: 'manager',
    choices: [1], //array of manager names, tbc
  }
  ]).then((data) => {
    console.log(`Employee ${data.firstName} ${data.lastName} has been added to the database.`);
    // db query incoming
  }).then(callback);
}

const updateEmployeeRolePrompt = (callback) => {
  inquirer.prompt([
    {
      type: 'list',
      message: 'Select the employee to update: ',
      name: 'employeeName',
      choices: [1], //array of employee names, tbc
    },
    {
      type: 'list',
      message: 'Select the new employee\'s role: ',
      name: 'employeeRole',
      choices: [1], //array of roles, tbc
    },
  ]).then((data) => {
    console.log(`Updated ${data.employeeName}'s information.`)
  }).then(callback);
}

const addRolePrompt = (callback) => {
  inquirer.prompt([
    {
      type: 'input',
      message: 'Enter the new role\'s name: ',
      name: 'roleName',
      validate: (input) => {
        if (input) {
          return true;
        } else {
          console.log("Please enter the role name.");
          return false;
        }
      },
    },
    {
      type: 'input',
      message: 'Enter the new role\'s salary: ',
      name: 'salary',
      validate: (input) => {
        if (input) {
          return true;
        } else {
          console.log("Please enter the role salary.");
          return false;
        }
      },
    },
    {
      type: 'list',
      message: 'Select the new role\'s department: ',
      name: 'roleDepartment',
      choices: [1] // array of departments, tbc
    }
  ]).then((data) => {
    console.log(`Added ${data.roleName} to the database.`)
  }).then(callback);
}

const addDepartmentPrompt = (callback) => {
  inquirer.prompt([
    {
      type: 'input',
      message: 'Enter the new department\'s name: ',
      name: 'departmentName',
      validate: (input) => {
        if (input) {
          return true;
        } else {
          console.log("Please enter the department name.");
          return false;
        }
      }
    }
  ]).then((data) => {
    console.log(`Added ${data.departmentName} to the database.`)
  }).then(callback);
}

const init = () => {
  inquirer.prompt([
      {
        type: 'list',
        message: 'What would you like to do?',
        name: 'choice',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
    }
  ])
    .then((data) => {
      if (data.choice === 'View All Employees') {
        renderEmployeeTable(init);
      } else if (data.choice === 'Add Employee') {
        addEmployeePrompt(init);
      } else if (data.choice === 'Update Employee Role') {
        updateEmployeeRolePrompt(init);
      } else if (data.choice === 'View All Roles') {
        // db query to view all roles
        init();
      } else if (data.choice === 'Add Role') {
        addRolePrompt(init);
      } else if (data.choice === 'View All Departments') {
        // db query to view all departments
        init();
      } else if (data.choice === 'Add Department') {
        addDepartmentPrompt(init);
      } else if (data.choice === 'Quit') {
        console.log('System exited :)\nPress CTRL + C to return to the terminal.');
      } else {
        console.log('Something went wrong :(');
      }
      // Add if statements for each choice w/ necesary function calls
      // Will call either another inquirer prompt function or a db query
    });
}

// Initalizes the program

init();