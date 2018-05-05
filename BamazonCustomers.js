const mysql = require("mysql");
const Table = require("cli-table");
const inquirer = require("inquirer");
const colors = require('colors');
const keys = require("./keys.js");          //password is stored

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: keys.keys.password,
    database: 'Bamazon'
});

var orderTotal = 0;

connection.connect(function (err) {
    if (err) throw err;
    //console.log("connected as id " + connection.threadId);
});

function logTitle() {
    var storeName = colors.yellow("Bamazon Hydroponics");
    var tagline = colors.yellow("Customer Portal");
    var tildas = colors.cyan('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');

    console.log("");
    console.log(colors.green('_______________________________________________________________________________________________________'));
    console.log("");
    console.log(`${tildas} ${storeName} ${tagline} ${tildas}`);
    console.log("");
    console.log(colors.green('_______________________________________________________________________________________________________'));
    console.log("");
}

logTitle();

//printable table of current items available
function showItemTable() {
    connection.query('SELECT * FROM products', function (err, results) {
        if (err) throw err;
        var table = new Table({
            head: [colors.cyan('id'), colors.cyan('item'), colors.cyan('price'), colors.cyan('quantity')],
            colWidths: [5, 70, 13, 10]
        });
        for (var i = 0; i < results.length; i++) {   //loop through 
            table.push(
                [(JSON.parse(JSON.stringify(results))[i]["item_id"]), (JSON.parse(JSON.stringify(results))[i]["product_name"]),
                ("$ " + JSON.parse(JSON.stringify(results))[i]["price"]), (JSON.parse(JSON.stringify(results))[i]["stock_quantity"])]);
        }
        console.log(colors.green('_______________________________________________________________________________________________________'));
        console.log("\n" + table.toString());  //prints the constructed cli-table to screen
        console.log(colors.green('_______________________________________________________________________________________________________'));
        console.log("");
    });
}

showItemTable();

function customerBuy() {
    inquirer.prompt([
        {
            type: 'input',
            message: 'What is the id # of the item you would like to purchase?',
            name: 'itemID',
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        },
        {
            type: 'input',
            message: 'What is the quantity you would like to buy?',
            name: 'quantity',
            validate: function (value) {
                if (isNaN(value) === false) {
                    return true;
                }
                return false;
            }
        }
    ]).then(function (answer) {
        var itemID = answer.itemID;            //store the users answer of id # as var itemID
        var quantity = answer.quantity;	 //store the users answer of purchase qty as var quantity
        connection.query('SELECT * FROM products WHERE item_id=?', [itemID], function (err, results) {
            if (err) throw err;
            var stock_quantity = results[0].stock_quantity;           //store the stock qty of the record queried as var stock_quantity
            if (stock_quantity < quantity) {
                console.log(colors.red("Sorry, we don't have the stock to fill that request. Please order at or below the quantity listed"));
                setTimeout(customerBuy, 1000);
            } else {
                stock_quantity -= quantity;  //subtract the users purchase qty from the store stock qty

                var totalPrice = quantity * results[0].price;
                var totalSales = totalPrice + results[0].product_sales;
                var department = results[0].department_name;

                console.log(colors.cyan("\nYour line item total on this product: $" + (quantity * results[0].price).toFixed(2)));

                orderTotal += (parseFloat(totalPrice));
                console.log(colors.cyan("\nYour order total of all products this session: ") + colors.yellow("$" + orderTotal.toFixed(2)) + "\n");

                connection.query('UPDATE products SET ? WHERE item_id=?', [{ stock_quantity: stock_quantity }, itemID], function (err, results) {
                    if (err) throw err;
                });
                connection.query('SELECT total_sales FROM departments WHERE department_name=?', [department], function (err, results) {
                    if (err) throw err;
                    var departmentTotal = results[0].total_sales + totalPrice;

                    connection.query('UPDATE departments SET total_sales=? WHERE department_name=?', [departmentTotal, department], function (err, results) {
                        if (err) throw err;
                    });
                });

                inquirer.prompt([
                    {
                        type: "confirm",
                        message: "Would you like to order another item?",
                        name: "yesOrNo",
                        default: true
                    }
                ]).then(function (data) {
                    if (data.yesOrNo) {
                        showItemTable();
                        setTimeout(customerBuy, 1500);
                    } else {
                        console.log(colors.green("Thank you for using Bamazon"));
                        process.exit(0);
                    }
                });
            }
        });
    });
}

setTimeout(customerBuy, 500); 