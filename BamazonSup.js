const mysql = require("mysql");
const Table = require("cli-table");
const inquirer = require("inquirer");
const colors = require('colors');
const keys = require("./keys.js");          //Password is stored

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: 'root',
    password: keys.keys.password,
    database: 'Bamazon'
});

connection.connect(function (err) {
    if (err) throw err;

});


function logTitle() {
    var storeName = colors.yellow("Bamazon Hydroponics");
    var tagline = colors.yellow("Supervisor Portal");
    var tildas = colors.cyan('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

    console.log("");
    console.log(colors.magenta('_______________________________________________________________________________________________________'));
    console.log("");
    console.log(`${tildas} ${storeName} ${tagline} ${tildas}`);
    console.log("");
    console.log(colors.magenta('_______________________________________________________________________________________________________'));
    console.log("");
}

logTitle();

function supervisorMenu() {
    inquirer.prompt([
        {
            type: 'list',
            message: 'Please choose a Bamazon supervisor task:',
            choices: ["View Product Sales by Department", "Create New Department", "Exit"],
            name: 'options'
        }
    ]).then(function (results) {
        switch (results.options) {
            case "View Product Sales by Department":
                showDeptTable();
                setTimeout(supervisorMenu, 1000);
                break;
            case "Create New Department":
                addNewDept();
                break;
            case 'Exit':
                console.log("Thank you for using Bamazon")
                process.exit(0);
                break;
        }
    });
};

supervisorMenu();


function showDeptTable() {
    connection.query('SELECT * FROM departments', function (err, results) {
        if (err) throw err;
        var table = new Table({
            head: [colors.magenta('id'), colors.magenta('department name'),
            colors.magenta('over-head costs'), colors.magenta('total sales'), colors.magenta('total profit')],
            colWidths: [5, 23, 23, 23, 23]
        });
        for (var i = 0; i < results.length; i++) {
            table.push(
                [(JSON.parse(JSON.stringify(results))[i]["department_id"]), (JSON.parse(JSON.stringify(results))[i]["department_name"]),
                ("$ " + JSON.parse(JSON.stringify(results))[i]["over_head_costs"].toFixed(2)), ("$ " + JSON.parse(JSON.stringify(results))[i]["total_sales"].toFixed(2)),
                ("$ " + parseFloat(results[i].total_sales - results[i].over_head_costs).toFixed(2))]);
        }
        console.log(colors.magenta('_______________________________________________________________________________________________________'));
        console.log("\n" + table.toString());
        console.log(colors.magenta('_______________________________________________________________________________________________________'));
        console.log("");
    });
};


function addNewDept() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'Please enter the department name.',
            name: 'dept_name'
        },
        {
            type: 'input',
            message: 'Please enter the over-head costs.',
            name: 'costs'
        }
    ]).then(function (answers) {
        var dept_name = answers.dept_name;
        var costs = answers.costs;
        var totalSales = 0;
        connection.query('INSERT INTO departments (department_name, over_head_costs, total_sales) VALUES (?, ?, ?)', [dept_name, costs, totalSales], function (err, results) {
            if (err) throw err;
        });
        if (dept_name && costs !== undefined) {
            setTimeout(showDeptTable, 500);
            setTimeout(supervisorMenu, 1500);
        }

    });

};
