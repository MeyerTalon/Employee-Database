// Imports

const mysql = require('mysql2');
const inquirer = require('inquirer');
const consoleTable = require('console.table');

// SQL Database Connection

require('dotenv').config();
const db = mysql.createConnection(
    {
      host: '127.0.0.1',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    console.log("Connected to db")
);

// Query functions

// const join = async () => {
//     const joinTables = await db.query('SELECT * FROM roles JOIN departments ON roles.departments = departmen.id');
//     return joinTables;
// };


// Inquirer Section

function inquirerPrompt() {
  inquirer.prompt([
      {
        type: 'list',
        message: "What would you like to do?",
        name: 'choice',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit'],
    },
  ])
    .then((data) => {
      if (data.choice === 'View All Employees') {
        // db query to display employees
        inquirerPrompt();
      } else if (data.choice === 'Quit') {
        console.log('System exited');
      }
      // Add if statements for each choice w/ necesary function calls
      // Will call either another inquirer prompt function or a db query
    });
}



inquirerPrompt();