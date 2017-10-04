var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pg = require('pg');
var mongoose = require('mongoose');
var format = require('string-format');

// var mysqlConnection = mysql.createConnection({
// 	host: 'localhost',user: 'root',password: 'password',database: 'Foods'
// });
// mysqlConnection.connect(function(err) {
// 	if (err) {console.log('Error connecting to mysql DB');}
// 	else console.log('Connection to mysql DB successful'); 
// });
console.log('db url is : ' + process.env.DATABASE_URL);
console.log('db env is : ' + process.env.NODE_ENV);
var pgConnString = process.env.DATABASE_URL || 'postgres://localhost:5432/prithvisathiya';
var pool = new pg.Pool(pgConnString);


/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'MealBuddy' }); 
}); 

function getReqQuery(req) {
	var dev = {"low" : .2, "medium" : .1, "high" : 0};
	if(req.max == Infinity) {
		var min = (parseInt(req.min) - parseInt(req.min) * dev[req.priority]);
		return 'and ' + req.name + ' > ' + mysql.escape(min) + ' '; 
	}else {
		var min = (parseInt(req.min) - parseInt(req.min) * dev[req.priority]);
		var max = (parseInt(req.max) + parseInt(req.max) * dev[req.priority]); 
		console.log(min + " " + max);
		return 'and ' + req.name + ' between ' + mysql.escape(min) + ' and ' + mysql.escape(max) + ' '; 
	}
} 

router.post('/submit', function(req, res, next) {
	var all = req.body.data;
	var query = "Select name, coalesce(servingsize,null) as servingsize, " +
	"coalesce(calories, null) as calories, " +
	"coalesce(fat, null) as fat, " +
	"coalesce(sugar, null) as sugar, " +
	"coalesce(potassium, null) as potassium, " +
	"coalesce(calcium, null) as calcium, " +
	"coalesce(phosphorous, null) as phosphorous, " +
	"coalesce(type, null) as type, " +
	"coalesce(cuisine, null) as cuisine, " +
	"imagePath " +
	"from items where 1=1 "; 
	all.forEach(function(el, idx) {
		query += getReqQuery(el);
		console.log(el.name + ' min: ' + el.min + ' max: ' + el.max);
		
	});
	console.log(query);
	pool.connect(function(err, client, done) {
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
				done()
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
