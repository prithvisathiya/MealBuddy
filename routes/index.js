var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var mongoose = require('mongoose');
var format = require('string-format');

var mysqlConnection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'password',
	database: 'Foods'
});

mysqlConnection.connect(function(err) {
	if (err) {
		console.log('Error connecting to DB');
	}else console.log('Connection to DB successful');
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
}); 

function getReqQuery(req) {
	var dev = {"low" : .2, "medium" : .1, "high" : 0};
	if(req.max == Infinity) {
		var min = (parseInt(req.min) - parseInt(req.min) * dev[req.priority]);
		return 'and `' + req.name + '` > ' + min + ' '; 
	}else {
		console.log(typeof(req.max));
		var min = (parseInt(req.min) - parseInt(req.min) * dev[req.priority]);
		var max = (parseInt(req.max) + parseInt(req.max) * dev[req.priority]);
		return 'and `' + req.name + '` between ' + min + ' and ' + max + ' '; 
	}
} 

router.post('/submit', function(req, res, next) {
	var all = req.body.data;
	var query = 'Select name, ifnull(servingsize,"N/A") as servingsize, ' +
	'ifnull(calories, "N/A") as calories, ' +
	'ifnull(fat, "N/A") as fat, ' +
	'ifnull(sugar, "N/A") as sugar, ' +
	'ifnull(potassium, "N/A") as potassium, ' +
	'ifnull(calcium, "N/A") as calcium, ' +
	'ifnull(phosphorous, "N/A") as phosphorous, ' +
	'ifnull(type, "N/A") as type, ' +
	'ifnull(cuisine, "N/A") as cuisine ' +
	'from items where 1=1 ';
	all.forEach(function(el, idx) {
		query += getReqQuery(el);
		console.log(el.name + ' min: ' + el.min + ' max: ' + el.max);
		
	});
	console.log(query);
	mysqlConnection.query(query, function(err, rows) {
		if(err) {
			console.log(err);
			console.log('DB: Error retrieving from items');
			res.write(JSON.stringify({"success": false}));
		}
		else {
			console.log('Number of rows retrieved: ' + rows.length);
			res.write(JSON.stringify({"success": true, "result": rows}));
		}
		res.end();
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
