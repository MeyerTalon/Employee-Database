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

// Creating arrays with names of SQL table columns to be used in inquirer prompts

let roleNamesArray = [];
db.query(`SELECT title FROM roles`, (err, results) => {
  if (err) {
    console.log(err);
  }
  let resultsArray = [];
  for (let i = 0; i < results.length; i++) {
    resultsArray.push(Object.values(results[i]));
    roleNamesArray.push(resultsArray[i][0]);
  }
});

let departmentNamesArray = [];
db.query(`SELECT department FROM departments`, (err, results) => {
  if (err) {
    console.log(err);
  }
  let resultsArray = [];
  for (let i = 0; i < results.length; i++) {
    resultsArray.push(Object.values(results[i]));
    departmentNamesArray.push(resultsArray[i][0]);
  }
});

let employeeNamesArray = [];
db.query(`SELECT first_name, last_name FROM employees`, (err, results) => {
  if (err) {
    console.log(err);
  }
  let resultsArray = [];
  for (let i = 0; i < results.length; i++) {
    resultsArray.push(Object.values(results[i]));
    employeeNamesArray.push(resultsArray[i][0] + ' ' + resultsArray[i][1]);
  }
});

let managerNamesArray = ['None'];
db.query(`SELECT first_name, last_name FROM employees WHERE manager_id IS NULL`, (err, results) => {
  if (err) {
    console.log(err);
  }
  let resultsArray = [];
  for (let i = 0; i < results.length; i++) {
    resultsArray.push(Object.values(results[i]));
    managerNamesArray.push(resultsArray[i][0] + ' ' + resultsArray[i][1]);
  }
});

let managerIdArray = [];
const populateManagerIdArray = () => {
  managerIdArray = [];
  db.query(`SELECT id FROM employees WHERE manager_id IS NULL`, (err, results) => {
    if (err) {
      console.log(err);
    }
    let resultsArray = [];
    for (let i = 0; i < results.length; i++) {
      resultsArray.push(Object.values(results[i]));
      managerIdArray.push(resultsArray[i][0]);
    }
  });
} 
populateManagerIdArray();

// Query functions

const renderEmployeeTable = (callback) => {
  db.query(`SELECT e.id, e.first_name, e.last_name, roles.title, departments.department, roles.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employees e JOIN roles ON e.role_id = roles.id JOIN departments ON roles.department_id = departments.id LEFT JOIN employees m ON m.id = e.manager_id`, (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
  });
  setTimeout(callback, 100);
}

const renderRolesTable = (callback) => {
  db.query(`SELECT roles.id, roles.title, departments.department, roles.salary FROM roles JOIN departments ON roles.department_id = departments.id`, (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
  });
  setTimeout(callback, 100);
}

const renderDepartmentsTable = (callback) => {
  db.query(`SELECT * FROM departments`, (err, results) => {
    if (err) {
      console.log(err);
    }
    console.table(results);
  });
  setTimeout(callback, 100);
}

const addEmployee = (firstName, lastName, roleId, managerId) => {
  db.query(`INSERT INTO employees(first_name, last_name, role_id, manager_id) VALUES(?, ?, ?, ?)`, [firstName, lastName, roleId, managerId], (err) => {
    if (err) {
      console.log(err);
    }
    const fullName = firstName + " " + lastName;
    employeeNamesArray.push(fullName);
    if (managerId === null) {
      managerNamesArray.push(fullName);
    }
  });
}
const addRole = (title, salary, departmentId) => {
  db.query(`INSERT INTO roles(title, salary, department_id) VALUES(?, ?, ?)`, [title, salary, departmentId], (err) => {
    if (err) {
      console.log(err);
    }
  });
  roleNamesArray.push(title);
}

const addDepartment = (department) => {
  db.query(`INSERT INTO departments(department) VALUES(?)`, [department], (err) => {
    if (err) {
      console.log(err);
    }
  });
  departmentNamesArray.push(department);
}

const updateEmployeeRole = (employeeId, roleId) => {
  db.query(`UPDATE employees SET role_id = ? WHERE id = ?`, [roleId, employeeId], (err) => {
    console.log(err);
  });
}

const renderBudget = async (departmentId, callback) => {
  db.query(`(SELECT SUM(salary) FROM roles WHERE roles.department_id = ?)`, [departmentId], (err, results) => {
    if (err) {
      console.log(err);
    }
    const budget = Object.values(results[0]);
    if (budget[0] === null) {
      budget[0] = 0;
    }
    console.log("Total utilized budget: $" + budget[0]);
    setTimeout(callback, 100);
  });
}

// Inquirer Functions

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
          console.log("Please enter a valid first name.");
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
          console.log("Please enter a valid last name.");
          return false;
        }
      }
    },
    {
      type: 'list',
      message: 'Select the employee\'s role',
      name: 'role',
      choices: roleNamesArray,
    },
    {
      type: 'list',
      message: 'Select the employee\'s manager: ',
      name: 'manager',
      choices: managerNamesArray,
  }
  ]).then((data) => {
    if (data.manager === 'None') {
      addEmployee(data.firstName, data.lastName, roleNamesArray.indexOf(data.role) + 1, null);
    } else {
      addEmployee(data.firstName, data.lastName, roleNamesArray.indexOf(data.role) + 1, managerIdArray[managerNamesArray.indexOf(data.manager) - 1]);
    }
    console.log(`Employee ${data.firstName} ${data.lastName} has been added to the database.`);
  }).then(populateManagerIdArray).then(callback);
}

const updateEmployeeRolePrompt = (callback) => {
  inquirer.prompt([
    {
      type: 'list',
      message: 'Select the employee to update: ',
      name: 'employeeName',
      choices: employeeNamesArray,
    },
    {
      type: 'list',
      message: 'Select the new employee\'s role: ',
      name: 'employeeRole',
      choices: roleNamesArray,
    },
  ]).then((data) => {
    updateEmployeeRole(employeeNamesArray.indexOf(data.employeeName) + 1, roleNamesArray.indexOf(data.employeeRole) + 1);
    console.log(`Employee ${data.employeeName}'s role has been updated.`);
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
          console.log("Please enter a valid role name.");
          return false;
        }
      },
    },
    {
      type: 'input',
      message: 'Enter the new role\'s salary: ',
      name: 'salary',
      validate: (input) => {
        if (isNaN(input)) {
          console.log(" Please enter a valid role salary.");
        } else {
          return true;
        }
      },
    },
    {
      type: 'list',
      message: 'Select the new role\'s department: ',
      name: 'roleDepartment',
      choices: departmentNamesArray
    }
  ]).then((data) => {
    addRole(data.roleName, data.salary, departmentNamesArray.indexOf(data.roleDepartment) + 1);
    console.log(`${data.roleName} has been added to the roles database.`)
  }).then(callback);
}

const addDepartmentPrompt = (callback) => {
  inquirer.prompt([
    {
      type: 'input',
      message: 'Enter the new department name: ',
      name: 'department',
    }
  ]).then((data) => {
    addDepartment(data.department);
    console.log(`${data.departmentName} has been added to the departments database.`)
  }).then(callback);
}

const viewDepartmentBudgetPrompt = (callback) => {
  inquirer.prompt([
    {
      type: 'list',
      message: 'Select a department: ',
      name: 'departmentName',
      choices: departmentNamesArray
    }
  ]).then(async (data) => {
    renderBudget(departmentNamesArray.indexOf(data.departmentName) + 1, callback);
  });
}

const init = () => {
  inquirer.prompt([
      {
        type: 'list',
        message: 'What would you like to do?',
        name: 'choice',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'View Utilized Budget of a Department', 'Quit'],
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
        renderRolesTable(init);
      } else if (data.choice === 'Add Role') {
        addRolePrompt(init);
      } else if (data.choice === 'View All Departments') {
        renderDepartmentsTable(init);
      } else if (data.choice === 'Add Department') {
        addDepartmentPrompt(init);
      } else if (data.choice === 'View Utilized Budget of Department') {
        viewDepartmentBudgetPrompt(init);
      } else if (data.choice === 'Quit') {
        console.log('System exited :)\nPress CTRL + C to return to the terminal.');
      } else {
        console.log('Something went wrong :(');
      }
    });
}

// Initalizes the program

init();
