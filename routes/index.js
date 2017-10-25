var express = require('express');
var router = express.Router();
var mysql = require('mysql');
// var pg = require('pg');
const { Client } = require('pg');
var mongoose = require('mongoose');
var format = require('string-format');
var pgConnString = process.env.DATABASE_URL || 'postgres://localhost:5432/prithvisathiya';

var cuisines = ['none', 'American', 'Italian', 'Indian', 'Japanese', 'Chinese', 'Korean', 'Mexican', 'Vietnamese', 'Thai', 'French', 'English'];
// var mysqlConnection = mysql.createConnection({
// 	host: 'localhost',user: 'root',password: 'password',database: 'Foods'
// });
// mysqlConnection.connect(function(err) {
// 	if (err) {console.log('Error connecting to mysql DB');}
// 	else console.log('Connection to mysql DB successful'); 
// });


console.log(pgConnString);

/* GET home page. */
router.get('/', function(req, res, next) { 
	res.render('index', { title: 'MealBuddy' }); 
}); 

function getReqQuery(req) {
	var dev = {"low" : .2, "medium" : .1, "high" : 0};
	if(req.max == Infinity) {
		var min = (parseFloat(req.min) - parseFloat(req.min) * dev[req.priority]);
		// return 'and ' + req.name + ' > ' + mysql.escape(min) + ' '; 
		return '';
	}else {
		var min = (parseFloat(req.min) - parseFloat(req.min) * dev[req.priority]);
		var max = (parseFloat(req.max) + parseFloat(req.max) * dev[req.priority]); 
		console.log(min + " " + max);
		// return 'and ' + req.name + ' between ' + mysql.escape(min) + ' and ' + mysql.escape(max) + ' '; 
		return 'and coalesce(' + req.name + ',0) < ' + mysql.escape(max) + ' '; 
	}
} 

router.post('/submit', function(req, res, next) {
	var all = req.body.data;
	var query = "Select Name, coalesce(servingsize,null) as servingsize, " +
	"coalesce(type, null) as Type, " +
	"coalesce(cuisine, null) as Cuisine, " +
	"coalesce(calories, null) as Calories, " +
	"Protein, " +
	"coalesce(fat, null) as Fat, " +
	"Carbohydrate, Fiber, " +
	"coalesce(sugar, null) as Sugar, " +
	"Iron, Magnesium, " +
	"coalesce(potassium, null) as Potassium, " +
	"coalesce(calcium, null) as Calcium, " +
	"coalesce(phosphorus, null) as Phosphorus, " +
	"Sodium, Zinc, " +
	"VitaminA, VitaminB6, VitaminB12, VitaminC, VitaminD, VitaminK, " +
	"Thiamin, Riboflavin, Niacin, " +
	"SaturatedFat, MonoUnsaturatedFat, PolyUnsaturatedFat, " +
	"Cholesterol, Caffeine, " +
	"imagePath " + 
	"from items_table where 1=1 "; 
	all.forEach(function(el, idx) {
		query += getReqQuery(el);
		console.log(el.name + ' min: ' + el.min + ' max: ' + el.max);
		
	});
	var cuisineIdx = parseInt(req.body.idx);
	if(cuisineIdx > 0) {
		// query += "and cuisine in ('none','" + cuisines[cuisineIdx] + "') ";
		query += "and (cuisine like '%" + cuisines[cuisineIdx] + "%' or cuisine like '%none%') ";
	}
	query += "order by group1, group2, group3"
	console.log(query);
	const client = new Client({
		connectionString: pgConnString
	});
	client.connect(function(err) {
		if(err) {
			console.log('Error connecting to pg DB');
			console.log(err);
			res.write(JSON.stringify({"success": false, "error": err}));
			res.end();
		} else {
			console.log('Connection to pg DB successful');
			client.query(query, function(err, result) {
				if(err) {
					console.log(err);
					console.log('DB: Error retrieving from items');
					res.write(JSON.stringify({"success": false, "error": err}));
				}
				else {
					console.log('Number of rows retrieved: ' + result.rows.length);
					res.write(JSON.stringify({"success": true, "result": result.rows}));
				}
				res.end();
				client.end();
			});
		}

	});
});

router.get('/getItems', function(req, res, next) {
	// console.log("fetching items from db")
	var data = [{"name": "something", "calories": 5},{"name": "nothing", "calories": 25}];
	mysqlConnection.query('Select * from items', function(err, rows) {
		if(err) console.log('DB: Error retrieving from items');
		else {
			console.log(rows);
			res.send(JSON.stringify({"result": rows}));
		}
		
	});
	
});




module.exports = router;
