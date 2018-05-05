var mysql = require("mysql");
var inquirer = require("inquirer");
var selectedItem = {};

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "",
  database: "bamazon"
});


function displayTable(){
  connection.query("SELECT * FROM products", function(err, res) {
    console.log('\nitem_id' + " | " + 'product_name' + " | " + 'department_name' + " | " + 'price' + " | " + 'stock_quantity')
    for (var i = 0; i < res.length; i++) {
      console.log('\n' + res[i].item_id + " | " + res[i].product_name + " | " + res[i].department_name + " | " + res[i].price + " | " + res[i].stock_quantity);
    }
    console.log("-----------------------------------");
    purchase();
  });
};
displayTable();

function purchase() {
  inquirer
    .prompt([
      {
        name: "item",
        type: "input",
        message: "What is the name of the product you would like to purchase?"
      },
      {
        name: "quantity",
        type: "input",
        message: "How many would you like to purchase?",
        validate: function(value) {
          if (isNaN(value) === false) {
            return true;
          }
          return false;
        }
      }
    ])
    .then(function(answer) {

      connection.query(
        'SELECT * FROM products WHERE product_name = ?',
        [answer.item],
        function(err, res) {
          selectedItem = res[0];
          if (err) throw err;
          if(answer.quantity < selectedItem.stock_quantity){
          console.log("Total cost: $" + selectedItem.price * parseInt(answer.quantity));
          console.log("Your purchase was completed successfully!");
          updateValue(parseInt(answer.quantity));
          connection.end();
          }
          if(answer.quantity > selectedItem.stock_quantity){
            console.log("Not enough stock to fulfill your order.");
            connection.end();
          }
        }
      );
    });
}
function updateValue(purchaseAmount){
  let updatedQuantity = selectedItem.stock_quantity - purchaseAmount;
  connection.query(
    "UPDATE products SET stock_quantity = ? WHERE product_name = ?",
    [updatedQuantity, selectedItem.product_name],
    function(err, res) {
      if (err) throw err;
      console.log("stock updated");
    }
  );
};