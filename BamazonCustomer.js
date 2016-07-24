//INITIALIZES THE NPM PACKAGES USED//
var mysql = require('mysql');
var inquirer = require('inquirer');
var Pass = require('./word');
var requestedItem = 0; 
var requestdItemId = 0;
var sumAfterUpdate = 0;
//INITIALIZES THE CONNECTION VARIABLE TO SYNC WITH A MYSQL DATABASE//
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root", //Your username//
    password: Pass.password, //Your password//
    database: "bamazon"
})

//CREATES THE CONNECTION WITH THE SERVER AND MAKES THE TABLE UPON SUCCESSFUL CONNECTION//
connection.connect(function(err) {
    if (err) {
        console.error("error connecting: " + err.stack);
    }
    makeTable();
})

//FUNCTION TO GRAB THE PRODUCTS TABLE FROM THE DATABASE AND PRINT RESULTS TO CONSOLE//
var makeTable = function() {
    //SELECTS ALL OF THE DATA FROM THE MYSQL PRODUCTS TABLE - SELECT COMMAND!
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        //PRINTS THE TABLE TO THE CONSOLE WITH MINIMAL STYLING//
        var tab = "\t";
        console.log("ItemID\tName\tDept\tPrice\t# In Stock");
        console.log("--------------------------------------------------------");
        //FOR LOOP GOES THROUGH THE MYSQL TABLE AND PRINTS EACH INDIVIDUAL ROW ON A NEW LINE//
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].ItemID + tab + res[i].ProductName + tab + res[i].DepartmentName + tab + res[i].Price + tab + res[i].StockQuantity);
        }
        console.log("--------------------------------------------------------");
        //RUNS THE CUSTOMER'S PROMPTS AFTER CREATING THE TABLE. SENDS res SO THE promptCustomer FUNCTION IS ABLE TO SEARCH THROUGH THE DATA//
        promptCustomer(res);
    });
};

var updateQuantity = function(){

    console.log("update Function running");

    connection.query('UPDATE products SET StockQuantity = ' + sumAfterUpdate + ' WHERE ItemID = ' + requestdItemId + '', function(err, res){

    });

    makeTable(); 

}


//FUNCTION CONTAINING ALL CUSTOMER PROMPTS//
var promptCustomer = function(res) {
        //PROMPTS USER FOR WHAT THEY WOULD LIKE TO PURCHASE//
        inquirer.prompt([{
            type: 'input',
            name: 'choice',
            message: 'What would you like to purchase?'
        }]).then(function(val) {

                //SET THE VAR correct TO FALSE SO AS TO MAKE SURE THE USER INPUTS A VALID PRODUCT NAME//
                var correct = false;
           
                //LOOPS THROUGH THE MYSQL TABLE TO CHECK THAT THE PRODUCT THEY WANTED EXISTS//
                for (var i = 0; i < res.length; i++) {
                    if(val.choice == res[i].ProductName){
                        correct = true;

                        console.log('Great, there are ' + res[i].StockQuantity + ' available!' );
                        requestedItem = res[i].StockQuantity;

                            requestdItemId = res[i].ItemID;


                           inquirer.prompt([{
                                type: 'input',
                                name: 'choice2',
                                message: 'How many would you like to buy?'
                            }]).then(function(val2) {                             
                              
                                if(val2.choice2 <= requestedItem){
                                    console.log('Fantastic! Enjoy this item!');
                                    sumAfterUpdate = requestedItem - val2.choice2;  
                                    updateQuantity();
                                    
                                }else{ 
                                    console.log('Sorry, we do not have enough of this item.');
                                    makeTable();
                                    
                                }

                    });   
                    }
                  //1. TODO: IF THE PRODUCT EXISTS, SET correct = true and ASK THE USER TO SEE HOW MANY OF THE PRODUCT THEY WOULD LIKE TO BUY//
                  //2. TODO: CHECK TO SEE IF THE AMOUNT REQUESTED IS LESS THAN THE AMOUNT THAT IS AVAILABLE//                       
                  //3. TODO: UPDATE THE MYSQL TO REDUCE THE StockQuanaity by the THE AMOUNT REQUESTED  - UPDATE COMMAND!
                  //4. TODO: SHOW THE TABLE again by calling the function that makes the table
                }

                //IF THE PRODUCT REQUESTED DOES NOT EXIST, RESTARTS PROMPT//
              if (i == res.length && correct == false) {
                    promptCustomer(res);
                }
            });
}
