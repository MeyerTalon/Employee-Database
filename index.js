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

